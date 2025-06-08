"""
Populates the DB with mock data for testing integrations.
"""
from datetime import datetime, timezone, timedelta
import base64
import json
import sys
import os
from pathlib import Path
from click import edit
import requests
import random

# Workaround to fix requests lib being hilariously slow (1 sec/request)
requests.packages.urllib3.util.connection.HAS_IPV6 = False

DATA_ROOT = sys.argv[1]
API_URL = sys.argv[2]
USER_PASSWORD = "asdasd1!" # Password for all users.
ADMIN_USERNAME = "pip12345"
ADMIN_PASSWORD = "pip1234$"

SUMMARY = "Lorem ipsum falcis mixtaeque terras maneret flavum, habet agri luget. Magis axem ulmo tristis tanto pignus factis attollo: mox duorum erat torquet corporibus noverit! Ad et terrae honor, fecerat sua umerum, contigerant Cancrum! Gradu vidi duris rectum!"

def get_token_header(token: str) -> dict:
    """
        Returns a header with the authorization field set to use a JWT token.
    """
    return {"Authorization": f"Bearer {token}"}

token = None
admin_token = None

import os
import subprocess
def execute(cmd):
    """
    Runs a command and returns a generator that yields its stdout line by line.
    """
    env = os.environ.copy()
    popen = subprocess.Popen(["cmd", "/C", cmd], env=env, stdout=subprocess.PIPE, universal_newlines=True)
    for stdout_line in iter(popen.stdout.readline, ""):
        yield stdout_line 
    popen.stdout.close()
    return_code = popen.wait()
    if return_code:
        raise subprocess.CalledProcessError(return_code, cmd)

class Client:
    def __init__(self, token):
        self.token = token

    def get(self, path: str):
        return requests.get(
            API_URL + path,
            headers=get_token_header(self.token) if self.token else None
        ).json()

    def post(self, path: str, payload: dict):
        resp = requests.post(
            API_URL + path,
            headers=get_token_header(self.token) if self.token else None,
            json=payload,
        )
        if resp.status_code != 200:
            print(f"Error while posting: {resp.status_code} {resp.text} {payload}")
        return resp.json()
    
    def patch(self, path: str, payload: dict):
        resp = requests.patch(
            API_URL + path,
            json=payload,
            headers=get_token_header(self.token) if self.token else None
        )
        assert resp.status_code == 200, f"Error while patching: {resp.status_code} {resp.text} using payload {payload}"
        return resp.json()
    
    def put(self, path: str, payload: dict):
        resp = requests.put(
            API_URL + path,
            json=payload,
            headers=get_token_header(self.token) if self.token else None
        )
        assert resp.status_code == 200, f"Error while putting: {resp.status_code} {resp.text}"
        return resp.json()

def get_time(minutesOffset):
    date = datetime.now(timezone.utc) + timedelta(minutes=minutesOffset)
    return date.isoformat()

# Login as admin
admin_response = requests.post(API_URL + "/users/login", json={
    "username": ADMIN_USERNAME,
    "password": ADMIN_PASSWORD,
})
admin_token = admin_response.json()["token"]
admin_client = Client(admin_token)

def get_resource_path(path):
    return DATA_ROOT + path

# Create users
def create_users():
    users = json.load(open(get_resource_path("/users.json"), "r"))
    for user in users["users"]:
        admin_client.post("/users", {
            "password": USER_PASSWORD,
            **user,
        })
    return users

CATEGORY_TAGS = {}

def create_categories(client):
    categories = json.load(open(get_resource_path("/categories_and_articles.json"), "r"))
    for category in categories["categories"]:
        client.post("/categories", category)
        CATEGORY_TAGS[category["directory_name"]] = category["random_tags"]

def create_articles(client: Client):
    # Log into dummy commenter account
    anon_login = requests.post(API_URL + "/users/login", json={
        "username": "DummyUser",
        "password": USER_PASSWORD,
    })
    anon_token = anon_login.json()["token"]
    anon_client = Client(anon_token)

    articles = json.load(open(get_resource_path("/articles.json"), "r"))

    # Add articles
    files_count = 0
    for categoryID, category in articles["articles"].items():
        for filename, metadata in category.items():
            path = get_resource_path("/articles/" + categoryID + "/" + filename + ".md")
            with open(path, "r") as f:
                name = metadata["name"]
                filename = name.replace(" ", "_").replace("&", "_")
                content = f.read()
                resp = client.post(f"/articles/{categoryID}/{filename}", {
                    "filename": filename,
                    "title": name,
                    "content": content,
                    "summary": SUMMARY,
                    "text": content,
                })
                print("feat img", f"/{metadata["img"]}")
                resp = client.patch(f"/articles/{categoryID}/{filename}", {
                    "is_visible": True,
                    "publish_time": get_time(-files_count * 45),
                    "can_comment": True,
                    "content": content, # To allow updating the source files
                    "featured_image_path": f"/{metadata["img"]}",
                    "summary": SUMMARY,
                    "tags": metadata["tags"] + random.sample(CATEGORY_TAGS[categoryID], random.randint(1, 2)), # Randomly select some extra tags from the category's themes
                })
                files_count += 1

                # Add annotations to carbonara article
                if filename == "Carbonara":
                    resp = client.patch(f"/articles/{categoryID}/{filename}", {
                        "annotations": [
                            {
                                "author": "editor123A",
                                "id": 16478529,
                                "comment": "The image is currently too small",
                                "start": 266,
                                "end": 309
                            },
                            {
                                "author": "editor123A",
                                "id": 7981534,
                                "comment": "TODO: move this to be after ingredients",
                                "start": 314,
                                "end": 319
                            },
                            {
                                "author": "editor123A",
                                "id": 4306119,
                                "comment": "TODO: this would look better as a bullet list",
                                "start": 681,
                                "end": 692
                            },
                            {
                                "author": "editor123A",
                                "id": 6031542,
                                "comment": "TODO: make this into a proper link",
                                "start": 1074,
                                "end": 1137
                            },
                            {
                                "author": "editor123A",
                                "id": 15915808,
                                "comment": "maybe tag it as cheesy or something",
                                "start": 1139,
                                "end": 1178
                            }
                        ]
                    })

                # Generate some comments if there weren't any (ex. from previous executions)
                if resp["comments_count"] == 0:
                    for i in range(5):
                        comment_resp = anon_client.post(f"/comments/{categoryID}/{filename}", {
                            "content": f"Lorem ipsum dolor **sit amet**, consectetur adipiscing elit. Integer arcu nisi, eleifend eu nunc eu, lobortis consectetur *nisl*. \n\n > Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla facilisi \n\n consectetur adipiscing elit. Integer arcu nisi.",
                        })

                        # Add a reply by the editor in some comments
                        if i % 2 == 0:
                            client.post(f"/comments/{categoryID}/{filename}", {
                                "parent_comment_id": comment_resp["id"],
                                "content": f"Lorem ipsum dolor **sit amet**, consectetur adipiscing elit. Integer arcu nisi, eleifend eu nunc eu, lobortis consectetur *nisl*. \n\n > Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla facilisi \n\n consectetur adipiscing elit. Integer arcu nisi.",
                            })

def create_files(client):
    # Add files
    all_files = []
    for (_, dirs, files) in os.walk(get_resource_path("/files")):
        for dir in dirs:
            DIRS = [
                "oriental",
                "pasta",
                "polish",
                "pastries"
            ]
            for DIR in DIRS:
                for (root, dirs, files) in os.walk(get_resource_path(f"/files/images/{DIR}")):
                    for filename in files:
                        all_files.append(f"{DIR}/{filename}")

    all_files.append(f"logo.png")
    all_files.append(f"logo_epic.png")
    all_files.append(f"favicon.png")

    # PUT all files into the CMS
    res_path = get_resource_path("/files/images")
    for filename in all_files:
        path = res_path + "/" + filename
        with open(path, "rb") as f:
            cms_path = path.replace(res_path, "") # Remove local path
            cms_path = cms_path.replace("\\", "/") # CMS expects forward slashes
            resp = client.put(f"/files" + cms_path, {
                "path": cms_path,
                "content": base64.encodebytes(f.read()).decode("ascii"),
            })

def create_config(client):
    # Add navigation
    with open(get_resource_path("/site_config.json"), "r") as f:
        site_config = json.load(f)
        client.patch("/site/config", site_config)

def create_sidebar(client: Client, editor_client: Client):
    # Add sidebar
    with open(get_resource_path("/sidebar.md"), "r") as f:
        document_name = "sidebar"
        content = f.read()

        # Update site config
        resp = admin_client.patch(f"/site/config", {
            "sidebar_document": content,
        })

if __name__ == "__main__":
    users = create_users()

    # Log-in as an editor
    editor_response = requests.post(API_URL + "/users/login", json={
        "username": users["users"][0]["username"],
        "password": USER_PASSWORD,
    })
    token = editor_response.json()["token"]

    editor_client = Client(token)

    create_categories(editor_client)
    create_files(editor_client)
    create_articles(editor_client)
    create_config(admin_client)
    create_sidebar(admin_client, editor_client)