from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import schemas.comment as CommentSchemas
import crud.article as ArticleCrud
import crud.comment as CommentCrud

router = APIRouter()

@router.post("/{article_path:path}", response_model=CommentSchemas.CommentOutput)
async def post_comment(article_path: str, comment_input: CommentSchemas.CommentInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Posts a comment.
    """
    try:
        article_path = "/" + article_path

        # Admins cannot post comments
        if current_user.admin:
            raise ValueError("Admins cannot post comments")

        article = ArticleCrud.get_article_by_full_path(db, article_path)
        comment = CommentCrud.create_comment(db, current_user, article, comment_input)
        return CommentCrud.create_comment_output(db, comment)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{article_path:path}", response_model=CommentSchemas.CommentsOutput)
async def get_comments(article_path: str, db: Session=Depends(get_db)):
    """
    Gets all comments of an article.
    """
    try:
        article_path = "/" + article_path
        article = ArticleCrud.get_article_by_full_path(db, article_path)
        return CommentCrud.create_comments_output(db, article)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{article_path:path}/{comment_id}")
async def delete_comment(article_path: str, comment_id: int, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Deletes a comment.
    """
    try:
        article_path = "/" + article_path
        article = ArticleCrud.get_article_by_full_path(db, article_path) # Will throw if the article is invalid, as santity check

        comment = CommentCrud.get_by_id(db, comment_id)
        
        # Auth check
        can_delete = (comment.author == current_user) or ((current_user.admin or current_user.editor)) # Only the author or site staff can delete comments
        if not can_delete:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Can only delete comments you authored")
        
        CommentCrud.delete_comment(db, comment)
        return "Comment deleted"
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
