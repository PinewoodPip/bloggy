"""
Tests for /comments/ API.
"""
from fastapi.testclient import TestClient
from main import app
from schemas.comment import *
from schemas.article import ArticleUpdate
from utils import ClientWrapper
from asserts import *
from fixtures import *

test_client = TestClient(app)

def test_create_comments(article_scenario):
    """
    Tests creating comments on articles.
    """
    client = ClientWrapper(test_client, article_scenario.editor_token_header)

    # Post some comments
    comments = [f"comment {i}" for i in range(4)]
    for comment in comments:
        response = client.post(f"/comments{article_scenario.article_path}", CommentInput(content=comment))
        assert is_ok_response(response)

    # Retrieve article and its comments
    output = client.get_and_validate(f"/comments{article_scenario.article_path}", CommentsOutput)
    assert len(output.comments) == 4
    for i, comment in enumerate(output.comments):
        assert comment.content == comments[::-1][i] # Comments are retrieved from latest to oldest
        assert comment.author.display_name == article_scenario.editor.display_name

    # Add reply
    reply_input = CommentInput(
        content="test reply",
        parent_comment_id=output.comments[0].id,
    )
    client.post(f"/comments{article_scenario.article_path}", reply_input)

    # Retrieve the comment and check for the reply
    output = client.get_and_validate(f"/comments{article_scenario.article_path}", CommentsOutput)
    assert len(output.comments) == 4
    comment_with_reply = output.comments[0]
    assert len(comment_with_reply.replies) == 1
    assert comment_with_reply.replies[0].content == reply_input.content

    # Test that admins cannot comment
    client = ClientWrapper(test_client, article_scenario.admin_token_header)
    response = client.post(f"/comments{article_scenario.article_path}", CommentInput(content="test"))
    assert is_bad_request(response, "cannot post")

def test_delete_comment(article_scenario):
    """
    Tests deleting comments and reply trees.
    """
    client = ClientWrapper(test_client, article_scenario.editor_token_header)

    # Post some comments
    comments = [f"comment {i}" for i in range(4)]
    replies = [f"reply {i}" for i in range(4)]
    outputs: list[CommentOutput] = []
    for comment in comments:
        response = client.post(f"/comments{article_scenario.article_path}", CommentInput(content=comment))
        comment_output = CommentOutput.model_validate(response.json())
        assert is_ok_response(response)
        outputs.append(comment_output)

        # Add replies
        for reply in replies:
            response = client.post(f"/comments{article_scenario.article_path}", CommentInput(
                content=reply,
                parent_comment_id=comment_output.id
                ))
            assert is_ok_response(response)
            
    # Delete a comment
    comment_ouput = outputs[2]
    response = client.delete(f"/comments{article_scenario.article_path}/{comment_ouput.id}")
    assert is_ok_response(response)

    # Fetch comments and check the deleted one is gone
    output = client.get_and_validate(f"/comments{article_scenario.article_path}", CommentsOutput)
    assert len(output.comments) == len(comments) - 1

def test_cant_comment(article_scenario):
    """
    Tests attempting to comment on articles with comments disabled.
    """
    client = ClientWrapper(test_client, article_scenario.editor_token_header)

    # Disable comments
    client.patch(f"/articles/{article_scenario.article_path[1:]}", ArticleUpdate(
        can_comment=False
    ))

    # Attempt to comment on the article
    response = client.post(f"/comments/{article_scenario.article_path[1:]}", CommentInput(content="test"))
    assert is_bad_request(response, "comments disabled")
