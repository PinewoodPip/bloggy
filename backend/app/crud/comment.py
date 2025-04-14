"""
    CRUD methods for category-related tables.
"""
from sqlalchemy.orm import Session
from schemas.comment import *
from models.comment import *
from models.article import Article
from models.user import User
import crud.article as ArticleCrud
import crud.user as UserCrud
import crud.utils as CrudUtils

UPDATE_CATEGORY_EXCLUDED_FIELDS = set("parent_category_path")

def create_comment(db: Session, user: User, article: Article, comment_input: CommentInput) -> Comment:
    """
    Adds a comment to an article.
    """
    if not article.can_comment:
        raise ValueError("The article has comments disabled")
    
    # Create comment
    comment = Comment(
        content=comment_input.content,
    )
    comment.author = user
    article.comments.append(comment)
    db.refresh(article)
    db.add(comment)

    # Attach to parent
    if comment_input.parent_comment_id:
        parent_comment = get_by_id(db, comment_input.parent_comment_id)
        parent_comment.replies.append(comment)

    db.commit()
    return comment

def update_comment(db: Session, comment: Comment, comment_update: CommentUpdate) -> Comment:
    """
    Updates a comment's content.
    """
    CrudUtils.patch_entity(comment, comment_update)

    db.commit()
    return comment

def delete_comment(db: Session, comment: Comment):
    """
    Deletes a comment and all its replies.
    """
    db.delete(comment)
    db.commit()

def get_by_id(db: Session, comment_id: int) -> Comment:
    """
    Returns a comment by its ID.
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise ValueError("There is no comment with that ID")
    return comment

def get_all(db: Session) -> list[Comment]:
    """
    Returns all comments on the site.
    """
    return db.query(Comment).all()

def create_comment_output(db: Session, comment: Comment) -> CommentOutput:
    """
    Creates an output schema for a comment.
    """
    replies = comment.replies
    date_str = comment.post_time.isoformat()
    return CrudUtils.create_schema(comment, CommentOutput, extra_fields={
        "author": UserCrud.create_user_output(comment.author),
        "post_time": date_str,
        "replies": [create_comment_output(db, reply) for reply in replies][::-1] # Order from newest to oldest
    })

def create_comments_output(db: Session, article: Article) -> CommentsOutput:
    """
    Creates an output schema for an article's comments.
    """
    return CommentsOutput(
        comments=[create_comment_output(db, comment) for comment in article.comments if comment.parent_comment == None][::-1], # Order from newest to oldest, and use only top-level comments (replies will be added recursively)
    )
