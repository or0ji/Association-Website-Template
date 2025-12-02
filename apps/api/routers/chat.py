"""Coze AI Chat Proxy"""
import json
import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
import os

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Coze API Configuration
# 请在 .env 文件中配置以下环境变量
COZE_API_BASE = "https://api.coze.cn"
COZE_BOT_ID = os.getenv("COZE_BOT_ID", "")
COZE_API_TOKEN = os.getenv("COZE_API_TOKEN", "")


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = "web_user"


def make_sse_message(data: dict) -> bytes:
    """格式化 SSE 消息并返回 bytes"""
    msg = f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
    return msg.encode('utf-8')


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat response from Coze AI"""
    
    async def event_generator() -> AsyncGenerator[bytes, None]:
        url = f"{COZE_API_BASE}/v3/chat"
        
        headers = {
            "Authorization": f"Bearer {COZE_API_TOKEN}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "bot_id": COZE_BOT_ID,
            "user_id": request.user_id or "web_user",
            "stream": True,
            "additional_messages": [
                {
                    "role": "user",
                    "content": request.message,
                    "content_type": "text",
                    "type": "question"
                }
            ],
            "parameters": {}
        }
        
        if request.conversation_id:
            payload["conversation_id"] = request.conversation_id
        
        print(f"[Coze] Request URL: {url}")
        print(f"[Coze] Payload: {json.dumps(payload, ensure_ascii=False)}")
        
        # 发送一个初始消息，确保连接建立
        yield make_sse_message({"type": "connected"})
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    print(f"[Coze] Response status: {response.status_code}")
                    
                    if response.status_code != 200:
                        error_text = await response.aread()
                        print(f"[Coze] Error: {error_text.decode()}")
                        yield make_sse_message({"type": "error", "content": f"API错误: {response.status_code}"})
                        return
                    
                    current_event = ""  # 保存当前事件类型
                    buffer = ""
                    
                    async for chunk in response.aiter_text():
                        buffer += chunk
                        
                        while "\n" in buffer:
                            line, buffer = buffer.split("\n", 1)
                            line = line.strip()
                            
                            if not line:
                                continue
                            
                            # 保存 event 类型
                            if line.startswith("event:"):
                                current_event = line[6:].strip()
                                print(f"[Coze] Event: {current_event}")
                                continue
                            
                            if line.startswith("data:"):
                                data_str = line[5:].strip()
                                if not data_str or data_str == "[DONE]":
                                    continue
                                
                                try:
                                    data = json.loads(data_str)
                                    
                                    if isinstance(data, str):
                                        continue
                                    
                                    # 使用保存的 event 类型
                                    event_type = current_event
                                    print(f"[Coze] Processing: {event_type}")
                                    
                                    # 消息增量 - 流式内容
                                    if event_type == "conversation.message.delta":
                                        content = data.get("content", "")
                                        if content:
                                            print(f"[Coze] Content: {content[:30]}...")
                                            yield make_sse_message({"type": "content", "content": content})
                                    
                                    # 消息完成
                                    elif event_type == "conversation.message.completed":
                                        role = data.get("role", "")
                                        msg_type = data.get("type", "")
                                        if role == "assistant" and msg_type == "answer":
                                            conv_id = data.get("conversation_id", "")
                                            print(f"[Coze] Answer completed, conv_id: {conv_id}")
                                            yield make_sse_message({"type": "done", "conversation_id": conv_id})
                                    
                                    # 聊天完成
                                    elif event_type == "conversation.chat.completed":
                                        print("[Coze] Chat completed")
                                        yield make_sse_message({"type": "completed"})
                                    
                                    # 聊天失败
                                    elif event_type == "conversation.chat.failed":
                                        last_error = data.get("last_error", {})
                                        error_code = last_error.get("code", 0)
                                        error_msg = last_error.get("msg", "服务暂时不可用")
                                        print(f"[Coze] Failed: {error_code} - {error_msg}")
                                        
                                        if error_code == 4028 or "insufficient" in str(error_msg).lower():
                                            error_msg = "AI 服务配额不足，请联系管理员"
                                        
                                        yield make_sse_message({"type": "error", "content": error_msg})
                                    
                                    # done 事件
                                    elif event_type == "done":
                                        print("[Coze] Done")
                                        yield make_sse_message({"type": "completed"})
                                    
                                    # 重置 event
                                    current_event = ""
                                        
                                except json.JSONDecodeError as e:
                                    print(f"[Coze] JSON error: {e}")
                                    continue
                        
        except httpx.TimeoutException:
            print("[Coze] Timeout")
            yield make_sse_message({"type": "error", "content": "请求超时，请稍后再试"})
        except Exception as e:
            print(f"[Coze] Exception: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            yield make_sse_message({"type": "error", "content": "网络错误，请稍后再试"})
        
        print("[Coze] Generator finished")
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache", 
            "Expires": "0",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/health")
async def chat_health():
    """Check if chat service is configured"""
    return {
        "status": "ok",
        "bot_configured": bool(COZE_BOT_ID),
    }
