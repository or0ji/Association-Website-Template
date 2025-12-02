"""Seed database with initial data"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Menu, Category, Article, Banner, Setting, MenuType
from auth import get_password_hash


def seed_database():
    """Create initial data for the application"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already seeded, skipping...")
            return
        
        print("Seeding database...")
        
        # 1. Create admin user
        admin = User(
            username="admin",
            password_hash=get_password_hash("123456")
        )
        db.add(admin)
        db.commit()
        print("✓ Created admin user (admin/123456)")
        
        # 2. Create categories
        categories = [
            Category(name="行业新闻", slug="hangye-xinwen", description="电力工程行业最新动态"),
            Category(name="协会动态", slug="xiehui-dongtai", description="协会工作动态和活动报道"),
            Category(name="通知公告", slug="tongzhi-gonggao", description="协会通知公告"),
            Category(name="政策法规", slug="zhengce-fagui", description="相关政策法规文件"),
            Category(name="会员风采", slug="huiyuan-fengcai", description="会员企业展示"),
        ]
        for cat in categories:
            db.add(cat)
        db.commit()
        print("✓ Created categories")
        
        # Get category IDs
        cat_dict = {c.slug: c.id for c in db.query(Category).all()}
        
        # 3. Create menus
        menus_data = [
            # Level 1 menus
            {"name": "首页", "slug": "home", "type": MenuType.page, "sort": 1, "page_content": ""},
            {"name": "协会概况", "slug": "about", "type": MenuType.page, "sort": 2},
            {"name": "新闻中心", "slug": "news", "type": MenuType.page, "sort": 3},
            {"name": "通知公告", "slug": "notice", "type": MenuType.category, "sort": 4, "category_id": cat_dict["tongzhi-gonggao"]},
            {"name": "会员服务", "slug": "member", "type": MenuType.page, "sort": 5},
            {"name": "政策法规", "slug": "policy", "type": MenuType.category, "sort": 6, "category_id": cat_dict["zhengce-fagui"]},
            {"name": "联系我们", "slug": "contact", "type": MenuType.page, "sort": 7, "page_content": """
<div class="contact-page">
    <h2>联系方式</h2>
    <p><strong>协会名称：</strong>山西省电力工程企业协会</p>
    <p><strong>办公地址：</strong>山西省太原市小店区长风街XXX号</p>
    <p><strong>联系电话：</strong>0351-XXXXXXXX</p>
    <p><strong>传真号码：</strong>0351-XXXXXXXX</p>
    <p><strong>电子邮箱：</strong>contact@sxpeea.cn</p>
    <p><strong>邮政编码：</strong>030000</p>
    <h2>交通指南</h2>
    <p>地铁：乘坐地铁X号线至XX站，从X出口步行约500米即可到达</p>
    <p>公交：乘坐XXX路、XXX路公交车至XX站下车</p>
</div>
"""},
        ]
        
        level1_menus = {}
        for m in menus_data:
            menu = Menu(**m)
            db.add(menu)
            db.commit()
            level1_menus[m["slug"]] = menu.id
        
        # Level 2 menus
        level2_menus = [
            # 协会概况子菜单
            {"name": "协会简介", "slug": "about-intro", "parent_id": level1_menus["about"], "type": MenuType.page, "sort": 1, "page_content": """
<div class="about-intro">
    <h2>协会简介</h2>
    <p>山西省电力工程企业协会成立于XXXX年，是由山西省内从事电力工程建设、设计、施工、监理、咨询等业务的企业自愿组成的全省性、行业性、非营利性社会组织。</p>
    <p>协会宗旨：遵守宪法、法律、法规和国家政策，遵守社会道德风尚。坚持为会员服务、为行业服务、为政府服务的原则，发挥桥梁和纽带作用，维护会员的合法权益，促进行业健康发展。</p>
    <h3>主要职能</h3>
    <ul>
        <li>组织开展行业调查研究，向政府有关部门反映行业和会员的意见、建议和要求</li>
        <li>参与制定行业发展规划、产业政策、行业标准等</li>
        <li>组织开展行业培训、技术交流和咨询服务</li>
        <li>组织开展行业自律，规范企业行为，维护市场秩序</li>
        <li>组织开展评优评先，表彰先进，推广先进经验</li>
    </ul>
</div>
"""},
            {"name": "协会章程", "slug": "about-charter", "parent_id": level1_menus["about"], "type": MenuType.page, "sort": 2, "page_content": """
<div class="charter">
    <h2>山西省电力工程企业协会章程</h2>
    <h3>第一章 总则</h3>
    <p><strong>第一条</strong> 本协会名称为山西省电力工程企业协会（以下简称"本协会"）。</p>
    <p><strong>第二条</strong> 本协会是由山西省内电力工程企业自愿组成的全省性、行业性、非营利性社会组织。</p>
    <p><strong>第三条</strong> 本协会的宗旨：遵守宪法、法律、法规和国家政策，遵守社会道德风尚。维护会员合法权益，促进行业健康发展。</p>
    <h3>第二章 业务范围</h3>
    <p><strong>第四条</strong> 本协会的业务范围包括：行业调研、政策建议、技术交流、培训教育、信息服务、行业自律等。</p>
    <p>（更多章程内容...）</p>
</div>
"""},
            {"name": "组织机构", "slug": "about-org", "parent_id": level1_menus["about"], "type": MenuType.page, "sort": 3, "page_content": """
<div class="org-structure">
    <h2>组织机构</h2>
    <h3>领导班子</h3>
    <p><strong>会长：</strong>XXX</p>
    <p><strong>副会长：</strong>XXX、XXX、XXX</p>
    <p><strong>秘书长：</strong>XXX</p>
    <h3>内设机构</h3>
    <ul>
        <li><strong>秘书处</strong> - 负责协会日常工作</li>
        <li><strong>会员服务部</strong> - 负责会员发展与服务</li>
        <li><strong>培训部</strong> - 负责行业培训工作</li>
        <li><strong>信息部</strong> - 负责信息收集与发布</li>
    </ul>
</div>
"""},
            {"name": "领导介绍", "slug": "about-leaders", "parent_id": level1_menus["about"], "type": MenuType.page, "sort": 4, "page_content": """
<div class="leaders">
    <h2>领导介绍</h2>
    <div class="leader-item">
        <h3>XXX - 会长</h3>
        <p>简介：资深电力工程专家，从事电力工程行业30余年，具有丰富的行业管理经验...</p>
    </div>
    <div class="leader-item">
        <h3>XXX - 副会长</h3>
        <p>简介：...</p>
    </div>
</div>
"""},
            # 新闻中心子菜单
            {"name": "行业新闻", "slug": "news-industry", "parent_id": level1_menus["news"], "type": MenuType.category, "sort": 1, "category_id": cat_dict["hangye-xinwen"]},
            {"name": "协会动态", "slug": "news-association", "parent_id": level1_menus["news"], "type": MenuType.category, "sort": 2, "category_id": cat_dict["xiehui-dongtai"]},
            # 会员服务子菜单
            {"name": "入会指南", "slug": "member-guide", "parent_id": level1_menus["member"], "type": MenuType.page, "sort": 1, "page_content": """
<div class="member-guide">
    <h2>入会指南</h2>
    <h3>入会条件</h3>
    <ol>
        <li>在山西省境内依法登记注册的电力工程企业</li>
        <li>具有独立法人资格</li>
        <li>承认本协会章程，愿意履行会员义务</li>
        <li>具有良好的商业信誉和经营业绩</li>
    </ol>
    <h3>入会程序</h3>
    <ol>
        <li>提交入会申请表</li>
        <li>提交企业营业执照副本复印件</li>
        <li>提交企业资质证书复印件</li>
        <li>协会审核通过后，缴纳会费</li>
        <li>颁发会员证书</li>
    </ol>
    <h3>会费标准</h3>
    <p>根据企业规模和资质等级，会费标准为XXX元/年 - XXX元/年</p>
</div>
"""},
            {"name": "会员风采", "slug": "member-showcase", "parent_id": level1_menus["member"], "type": MenuType.category, "sort": 2, "category_id": cat_dict["huiyuan-fengcai"]},
        ]
        
        for m in level2_menus:
            menu = Menu(**m)
            db.add(menu)
        db.commit()
        print("✓ Created menus")
        
        # 4. Create articles
        articles_data = [
            # 行业新闻
            {"title": "山西省电力工程行业2024年度工作会议顺利召开", "category_id": cat_dict["hangye-xinwen"], "is_top": True},
            {"title": "国家能源局发布新版电力工程施工规范", "category_id": cat_dict["hangye-xinwen"]},
            {"title": "山西省加快推进新能源项目建设", "category_id": cat_dict["hangye-xinwen"]},
            # 协会动态
            {"title": "协会组织会员企业赴外省考察学习", "category_id": cat_dict["xiehui-dongtai"]},
            {"title": "协会成功举办2024年度技术培训班", "category_id": cat_dict["xiehui-dongtai"]},
            # 通知公告
            {"title": "关于召开2024年度会员大会的通知", "category_id": cat_dict["tongzhi-gonggao"], "is_top": True},
            {"title": "关于缴纳2024年度会费的通知", "category_id": cat_dict["tongzhi-gonggao"]},
            {"title": "关于开展安全生产专项检查的通知", "category_id": cat_dict["tongzhi-gonggao"]},
            # 政策法规
            {"title": "《电力建设工程施工安全管理办法》解读", "category_id": cat_dict["zhengce-fagui"]},
            {"title": "山西省电力工程企业资质管理办法", "category_id": cat_dict["zhengce-fagui"]},
        ]
        
        for i, a in enumerate(articles_data):
            article = Article(
                title=a["title"],
                slug=f"article-{i+1}",
                cover="/uploads/default-cover.jpg",
                summary=f"这是《{a['title']}》的摘要内容，详细介绍了相关事项的背景、目的和主要内容...",
                content=f"""
<div class="article-content">
    <p>这是《{a['title']}》的正文内容。</p>
    <p>文章详细介绍了相关事项的背景、目的、主要内容和具体要求。各会员单位应认真学习领会，切实贯彻执行。</p>
    <h3>一、背景介绍</h3>
    <p>为进一步规范行业管理，提高服务质量，根据上级有关要求，结合我省实际情况，特制定本办法/通知。</p>
    <h3>二、主要内容</h3>
    <p>（一）加强组织领导，明确责任分工</p>
    <p>（二）完善工作机制，提高工作效率</p>
    <p>（三）强化监督检查，确保工作落实</p>
    <h3>三、工作要求</h3>
    <p>各会员单位要高度重视，认真组织学习，确保相关工作顺利开展。</p>
</div>
""",
                category_id=a["category_id"],
                is_published=True,
                is_top=a.get("is_top", False),
                view_count=100 + i * 50,
                published_at=datetime.utcnow() - timedelta(days=i * 3)
            )
            db.add(article)
        db.commit()
        print("✓ Created articles")
        
        # 5. Create banners
        banners = [
            Banner(title="山西省电力工程企业协会", image="/uploads/banner1.jpg", link="/", sort=1, is_active=True),
            Banner(title="服务会员 服务行业 服务社会", image="/uploads/banner2.jpg", link="/page/about-intro", sort=2, is_active=True),
            Banner(title="2024年度会员大会", image="/uploads/banner3.jpg", link="/article/6", sort=3, is_active=True),
        ]
        for b in banners:
            db.add(b)
        db.commit()
        print("✓ Created banners")
        
        # 6. Create settings
        settings_data = [
            Setting(key="site_name", value="山西省电力工程企业协会"),
            Setting(key="site_icp", value="晋ICP备XXXXXXXX号"),
            Setting(key="site_phone", value="0351-XXXXXXXX"),
            Setting(key="site_address", value="山西省太原市小店区长风街XXX号"),
            Setting(key="site_email", value="contact@sxpeea.cn"),
            Setting(key="site_copyright", value="© 2024 山西省电力工程企业协会 版权所有"),
        ]
        for s in settings_data:
            db.add(s)
        db.commit()
        print("✓ Created settings")
        
        print("\n✅ Database seeded successfully!")
        print("Admin credentials: admin / 123456")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

