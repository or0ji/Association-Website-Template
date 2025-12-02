from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import MenuType


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Menu schemas
class MenuBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None
    type: MenuType = MenuType.page
    page_content: Optional[str] = None
    category_id: Optional[int] = None
    sort: int = 0
    is_visible: bool = True


class MenuCreate(MenuBase):
    pass


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    type: Optional[MenuType] = None
    page_content: Optional[str] = None
    category_id: Optional[int] = None
    sort: Optional[int] = None
    is_visible: Optional[bool] = None


class MenuResponse(MenuBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MenuTreeResponse(MenuResponse):
    children: List["MenuTreeResponse"] = []
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


# Category schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Article schemas
class ArticleBase(BaseModel):
    title: str
    slug: Optional[str] = None
    cover: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[int] = None
    is_published: bool = False
    is_top: bool = False


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    cover: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = None
    is_top: Optional[bool] = None


class ArticleListResponse(BaseModel):
    id: int
    title: str
    slug: Optional[str]
    cover: Optional[str]
    summary: Optional[str]
    category_id: Optional[int]
    is_published: bool
    is_top: bool
    view_count: int
    published_at: Optional[datetime]
    created_at: datetime
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


class ArticleDetailResponse(ArticleListResponse):
    content: Optional[str]
    prev_article: Optional[dict] = None
    next_article: Optional[dict] = None


# Banner schemas
class BannerBase(BaseModel):
    title: Optional[str] = None
    image: str
    link: Optional[str] = None
    sort: int = 0
    is_active: bool = True


class BannerCreate(BannerBase):
    pass


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None
    sort: Optional[int] = None
    is_active: Optional[bool] = None


class BannerResponse(BannerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Setting schemas
class SettingItem(BaseModel):
    key: str
    value: Optional[str] = None


class SettingsUpdate(BaseModel):
    settings: List[SettingItem]


class SettingsResponse(BaseModel):
    site_name: Optional[str] = None
    site_icp: Optional[str] = None
    site_phone: Optional[str] = None
    site_address: Optional[str] = None
    site_email: Optional[str] = None
    site_copyright: Optional[str] = None


# Pagination
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int

