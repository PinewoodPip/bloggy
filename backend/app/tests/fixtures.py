"""
Fixtures for common test scenarios, pre-creating required entities.
"""
from utils import create_random_auth_editor, create_random_admin, create_random_file, get_session, get_token_header, create_random_category, create_random_article, random_lower_string
from utils import RandomEditor
from dataclasses import dataclass, asdict
from schemas.category import CategoryOutput
from schemas.article import ArticleOutput
from schemas.file import FileOutput, FileInput
import pytest

@dataclass
class UserTestScenario:
    admin: RandomEditor
    admin_token_header: dict
    editor: RandomEditor
    editor_token_header: dict

@dataclass
class ArticleTestScenario(UserTestScenario):
    category: CategoryOutput
    category_path: str
    article: ArticleOutput
    article_path: str

@dataclass
class FileTestScenario(UserTestScenario):
    """
    A scenario with user accounts and uploaded files.
    """
    files: list[FileOutput]

@pytest.fixture
def user_scenario() -> UserTestScenario:
    """
    A fixture that creates an admin & editor.
    """
    admin = create_random_admin(get_session())
    admin_header = get_token_header(admin.token)
    
    editor = create_random_auth_editor(get_session())
    editor_header = get_token_header(editor.token)

    return UserTestScenario(
        admin=admin,
        admin_token_header=admin_header,
        editor=editor,
        editor_token_header=editor_header,
    )

@pytest.fixture
def article_scenario(user_scenario) -> ArticleTestScenario:
    """
    A fixture that creates an admin & editor, a category and article.
    """
    db = get_session()
    category_output = create_random_category(db)
    article_output = create_random_article(db, category_output.path)
    return ArticleTestScenario(
        category=category_output,
        category_path=category_output.path,
        article=article_output,
        article_path=article_output.path,
        **asdict(user_scenario),
    )

@pytest.fixture
def file_scenario(user_scenario) -> FileTestScenario:
    db = get_session()
    files = []
    for _ in range(5):
        files.append(create_random_file(db, user_scenario.editor.username))
    return FileTestScenario(
        files=files,
        **asdict(user_scenario)
    )