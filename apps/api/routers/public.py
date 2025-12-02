from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from database import get_db
from models import Menu, Category, Article, Banner, Setting, MenuType
from schemas import (
    MenuTreeResponse, ArticleListResponse, ArticleDetailResponse,
    BannerResponse, SettingsResponse
)

router = APIRouter(prefix="/api", tags=["Public"])


def build_menu_tree(menus: List[Menu], parent_id: Optional[int] = None) -> List[dict]:
    """Build hierarchical menu tree"""
    tree = []
    for menu in menus:
        if menu.parent_id == parent_id:
            children = build_menu_tree(menus, menu.id)
            menu_dict = {
                "id": menu.id,
                "name": menu.name,
                "slug": menu.slug,
                "parent_id": menu.parent_id,
                "type": menu.type,
                "page_content": menu.page_content,
                "category_id": menu.category_id,
                "sort": menu.sort,
                "is_visible": menu.is_visible,
                "created_at": menu.created_at,
                "children": children,
                "category_name": menu.category.name if menu.category else None
            }
            tree.append(menu_dict)
    tree.sort(key=lambda x: x["sort"])
    return tree


@router.get("/menus/tree")
def get_menu_tree(db: Session = Depends(get_db)):
    """Get full menu tree for navigation"""
    menus = db.query(Menu).filter(Menu.is_visible == True).order_by(Menu.sort).all()
    tree = build_menu_tree(menus)
    return tree


@router.get("/pages/{slug}")
def get_page_content(slug: str, db: Session = Depends(get_db)):
    """Get single page content by slug"""
    menu = db.query(Menu).filter(
        Menu.slug == slug,
        Menu.type == MenuType.page,
        Menu.is_visible == True
    ).first()
    
    if not menu:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {
        "id": menu.id,
        "name": menu.name,
        "slug": menu.slug,
        "content": menu.page_content
    }


@router.get("/categories/{slug}")
def get_category_articles(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get articles by category slug with pagination"""
    # Find the menu with this slug
    menu = db.query(Menu).filter(
        Menu.slug == slug,
        Menu.type == MenuType.category,
        Menu.is_visible == True
    ).first()
    
    if not menu or not menu.category_id:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = db.query(Category).filter(Category.id == menu.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Query articles
    query = db.query(Article).filter(
        Article.category_id == category.id,
        Article.is_published == True
    )
    
    total = query.count()
    
    articles = query.order_by(
        desc(Article.is_top),
        desc(Article.published_at)
    ).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description
        },
        "items": [
            {
                "id": a.id,
                "title": a.title,
                "slug": a.slug,
                "cover": a.cover,
                "summary": a.summary,
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


@router.get("/articles/latest")
def get_latest_articles(
    limit: int = Query(10, ge=1, le=20),
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get latest articles for homepage"""
    query = db.query(Article).filter(Article.is_published == True)
    
    if category_id:
        query = query.filter(Article.category_id == category_id)
    
    articles = query.order_by(
        desc(Article.is_top),
        desc(Article.published_at)
    ).limit(limit).all()
    
    return [
        {
            "id": a.id,
            "title": a.title,
            "slug": a.slug,
            "cover": a.cover,
            "summary": a.summary,
            "category_id": a.category_id,
            "category_name": a.category.name if a.category else None,
            "is_top": a.is_top,
            "view_count": a.view_count,
            "published_at": a.published_at,
            "created_at": a.created_at
        }
        for a in articles
    ]


@router.get("/articles/{article_id}")
def get_article_detail(article_id: int, db: Session = Depends(get_db)):
    """Get article detail with prev/next navigation"""
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.is_published == True
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    article.view_count = (article.view_count or 0) + 1
    db.commit()
    
    # Get prev article
    prev_article = db.query(Article).filter(
        Article.category_id == article.category_id,
        Article.is_published == True,
        Article.published_at < article.published_at
    ).order_by(desc(Article.published_at)).first()
    
    # Get next article
    next_article = db.query(Article).filter(
        Article.category_id == article.category_id,
        Article.is_published == True,
        Article.published_at > article.published_at
    ).order_by(asc(Article.published_at)).first()
    
    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "cover": article.cover,
        "summary": article.summary,
        "content": article.content,
        "category_id": article.category_id,
        "category_name": article.category.name if article.category else None,
        "is_top": article.is_top,
        "view_count": article.view_count,
        "published_at": article.published_at,
        "created_at": article.created_at,
        "prev_article": {"id": prev_article.id, "title": prev_article.title} if prev_article else None,
        "next_article": {"id": next_article.id, "title": next_article.title} if next_article else None
    }


@router.get("/banners", response_model=List[BannerResponse])
def get_banners(db: Session = Depends(get_db)):
    """Get active banners"""
    banners = db.query(Banner).filter(
        Banner.is_active == True
    ).order_by(Banner.sort).all()
    return banners


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    """Get public site settings"""
    settings = db.query(Setting).all()
    settings_dict = {s.key: s.value for s in settings}
    return settings_dict

