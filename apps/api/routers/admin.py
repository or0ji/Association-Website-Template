from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
import os
import uuid
import shutil

from database import get_db
from models import User, Menu, Category, Article, Banner, Setting, MenuType
from schemas import (
    Token, LoginRequest, MenuCreate, MenuUpdate, MenuResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ArticleCreate, ArticleUpdate, ArticleListResponse,
    BannerCreate, BannerUpdate, BannerResponse,
    SettingItem
)
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from config import settings

router = APIRouter(prefix="/api", tags=["Admin"])


# ============ Auth ============
@router.post("/auth/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username}


# ============ Menu Management ============
@router.get("/admin/menus")
def list_menus(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    menus = db.query(Menu).order_by(Menu.sort).all()
    result = []
    for menu in menus:
        result.append({
            "id": menu.id,
            "name": menu.name,
            "slug": menu.slug,
            "parent_id": menu.parent_id,
            "type": menu.type,
            "page_content": menu.page_content,
            "category_id": menu.category_id,
            "category_name": menu.category.name if menu.category else None,
            "sort": menu.sort,
            "is_visible": menu.is_visible,
            "created_at": menu.created_at
        })
    return result


@router.post("/admin/menus")
def create_menu(
    menu_data: MenuCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    # Check slug uniqueness
    existing = db.query(Menu).filter(Menu.slug == menu_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    menu = Menu(**menu_data.model_dump())
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return {"id": menu.id, "message": "Menu created successfully"}


@router.put("/admin/menus/{menu_id}")
def update_menu(
    menu_id: int,
    menu_data: MenuUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Check slug uniqueness if changing
    if menu_data.slug and menu_data.slug != menu.slug:
        existing = db.query(Menu).filter(Menu.slug == menu_data.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    for key, value in menu_data.model_dump(exclude_unset=True).items():
        setattr(menu, key, value)
    
    db.commit()
    return {"message": "Menu updated successfully"}


@router.delete("/admin/menus/{menu_id}")
def delete_menu(
    menu_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Check for children
    children = db.query(Menu).filter(Menu.parent_id == menu_id).count()
    if children > 0:
        raise HTTPException(status_code=400, detail="Cannot delete menu with children")
    
    db.delete(menu)
    db.commit()
    return {"message": "Menu deleted successfully"}


# ============ Category Management ============
@router.get("/admin/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Category).order_by(Category.id).all()


@router.post("/admin/categories")
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    existing = db.query(Category).filter(Category.slug == category_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    category = Category(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"id": category.id, "message": "Category created successfully"}


@router.put("/admin/categories/{category_id}")
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category_data.slug and category_data.slug != category.slug:
        existing = db.query(Category).filter(Category.slug == category_data.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    for key, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    
    db.commit()
    return {"message": "Category updated successfully"}


@router.delete("/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for articles
    articles_count = db.query(Article).filter(Article.category_id == category_id).count()
    if articles_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with articles")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


# ============ Article Management ============
@router.get("/admin/articles")
def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    is_published: Optional[bool] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    query = db.query(Article)
    
    if category_id:
        query = query.filter(Article.category_id == category_id)
    if is_published is not None:
        query = query.filter(Article.is_published == is_published)
    if keyword:
        query = query.filter(Article.title.ilike(f"%{keyword}%"))
    
    total = query.count()
    articles = query.order_by(desc(Article.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "items": [
            {
                "id": a.id,
                "title": a.title,
                "slug": a.slug,
                "cover": a.cover,
                "summary": a.summary,
                "category_id": a.category_id,
                "category_name": a.category.name if a.category else None,
                "is_published": a.is_published,
                "is_top": a.is_top,
                "view_count": a.view_count,
                "published_at": a.published_at,
                "created_at": a.created_at
            }
            for a in articles
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/admin/articles/{article_id}")
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "cover": article.cover,
        "summary": article.summary,
        "content": article.content,
        "category_id": article.category_id,
        "is_published": article.is_published,
        "is_top": article.is_top,
        "view_count": article.view_count,
        "published_at": article.published_at,
        "created_at": article.created_at
    }


@router.post("/admin/articles")
def create_article(
    article_data: ArticleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    article = Article(**article_data.model_dump())
    if article.is_published and not article.published_at:
        article.published_at = datetime.utcnow()
    
    db.add(article)
    db.commit()
    db.refresh(article)
    return {"id": article.id, "message": "Article created successfully"}


@router.put("/admin/articles/{article_id}")
def update_article(
    article_id: int,
    article_data: ArticleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    for key, value in article_data.model_dump(exclude_unset=True).items():
        setattr(article, key, value)
    
    # Set published_at if publishing for first time
    if article.is_published and not article.published_at:
        article.published_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Article updated successfully"}


@router.delete("/admin/articles/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    db.delete(article)
    db.commit()
    return {"message": "Article deleted successfully"}


# ============ Banner Management ============
@router.get("/admin/banners", response_model=List[BannerResponse])
def list_banners(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Banner).order_by(Banner.sort).all()


@router.post("/admin/banners")
def create_banner(
    banner_data: BannerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    banner = Banner(**banner_data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return {"id": banner.id, "message": "Banner created successfully"}


@router.put("/admin/banners/{banner_id}")
def update_banner(
    banner_id: int,
    banner_data: BannerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    for key, value in banner_data.model_dump(exclude_unset=True).items():
        setattr(banner, key, value)
    
    db.commit()
    return {"message": "Banner updated successfully"}


@router.delete("/admin/banners/{banner_id}")
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    db.delete(banner)
    db.commit()
    return {"message": "Banner deleted successfully"}


# ============ Settings Management ============
@router.get("/admin/settings")
def get_all_settings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    settings_list = db.query(Setting).all()
    return {s.key: s.value for s in settings_list}


@router.put("/admin/settings")
def update_settings(
    settings_data: List[SettingItem],
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    for item in settings_data:
        setting = db.query(Setting).filter(Setting.key == item.key).first()
        if setting:
            setting.value = item.value
        else:
            setting = Setting(key=item.key, value=item.value)
            db.add(setting)
    
    db.commit()
    return {"message": "Settings updated successfully"}


# ============ File Upload ============
@router.post("/admin/upload")
async def upload_file(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Create date-based directory
    date_dir = datetime.now().strftime("%Y/%m")
    upload_path = os.path.join(settings.UPLOAD_DIR, date_dir)
    os.makedirs(upload_path, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_path, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    url = f"/uploads/{date_dir}/{filename}"
    return {"url": url, "filename": filename}


# ============ Dashboard Stats ============
@router.get("/admin/stats")
def get_dashboard_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return {
        "total_articles": db.query(Article).count(),
        "published_articles": db.query(Article).filter(Article.is_published == True).count(),
        "total_categories": db.query(Category).count(),
        "total_menus": db.query(Menu).count(),
        "total_banners": db.query(Banner).filter(Banner.is_active == True).count()
    }

