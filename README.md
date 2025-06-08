# Bloggy
Bloggy is a full-stack blogging CMS site built with Nuxt & FastAPI, which allows for creating and managing rich text articles through a control panel with an integrated WYSIWYG editor and publishing them for reading on a theme-able SSR site.

Bloggy is simple but feature-rich, being usable out of the box while also aiming to be extensible and customizable for building more complex sites centered around article content.

![Published site.](/docs/images/site/category.png)

Major features include:

- Admin dashboard for managing site content, user accounts and site branding
- A rich text editor for article creation with collaborative features
- Organizing articles into categories, with pagination, search, post scheduling, and tagging
- Theming support and multiple layouts for the published site
- Comment system, Google SSO authentication and social media sharing
- Server-side rendering of published content for fast & responsive user experience and proper SEO
- File CMS for managing images and other assets

See [features](#features-and-usage) for a tour of what Bloggy offers.

## Services
The project is divided into two main services:

- **Frontend**: Built with Nuxt.js, using daisyUI for theming and combining both server-side and client-side rendering for good performance across the site & admin dashboard. 
- **Backend**: RESTful API powered by FastAPI, persisting site data (articles, users, files, config) to PostgreSQL with support for indexing article content to ElasticSearch.

## Installation

To run locally, clone the respository and configure `.docker.env` files within both the `frontend` and `backend` folders.

Environment variables for the backend:
```env
SECRET_KEY= # For password hashing and JWT signing
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=3 # Expiration time for auth tokens
ADMIN_USERNAME= # Username of default admin account
ADMIN_PASSWORD= # Password of default admin account
DB_NAME= # Name of the Postgres database
DB_ADDRESS= # Postgres DB address
DB_USERNAME= # Postgres DB username
DB_PASSWORD= # Postgres DB password
ES_ENABLED= # Whether to enable ElasticSearch and search features on the site
ES_URL= # URL for ElasticSearch service
ES_USERNAME= # Username for ElasticSearch
ES_PASSWORD= # Password for ElasticSearch
GOOGLE_CLIENT_URL= # Google cloud application ID for SSO (optional)
```

Environment variables for the frontend:
```env
NUXT_PUBLIC_API_URL= # URL for the backend API service used by clients (SPA)
NUXT_PUBLIC_SERVER_API_URL= # URL for the backend API service used by server-side rendering (SSR)
NUXT_PUBLIC_GOOGLE_CLIENT_URL= # Google cloud application ID for SSO (optional)
NUXT_PUBLIC_GTAG_ID= # Google analytics ID (optional)
```
  
With the env files prepared, launch all services using Docker Compose:

```bash
docker-compose up --build
```

This will build and run the frontend, backend, and database services. The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`. **Elasticsearch is not included in the compose file due to performance overhead.**

Additionally, pgAdmin is available at `http://localhost:8001` for managing the PostgreSQL database.

### Demo

Some mock data for the database is provided in `backend/mock_data`, which may be applied by running the `populate_db.py` script while the backend is running. This script creates users, articles, files and configs to model a cooking-themed blog site; the same one that is shown in the screenshots below.

## Features and usage

The project's frontend is split into two main sections: the public site where site visitors can read the articles, and an admin dashboard for authoring content and managing the site.

The site's content is managed at an admin dashboard accessible at `/admin/login`. Initially you will need to log in using the default admin account with the credentials specified in the `.docker.env` file.

Once logged in, you can use the various tabs of the control panel to create accounts for article editors and manage the site's configuration.

### Users
The users tab allows you to create and manage user accounts for *editors* which will author and manage the content of the site.

![Users tab.](/docs/images/admin/users.png)

The admin accounts are intended for site-wide configuration and management only; you're intended to create editor accounts for each person who will be writing articles for the site.

Editor accounts can be assigned avatars (first uploaded to the [site file CMS](#files)) and short biographies which will be displayed on the site on articles they authored.

### Content
The content tab is where you can create and manage the articles for the site.

![Content management tab.](/docs/images/admin/content.png)

Articles are organized into categories; each acts as a separate section/index of the site to group articles by a major topic/theme. A generic "root" category exists by default, but you're encouraged to create subcategories to organize your articles.

Creating an article or clicking on an existing one opens the [rich text editor](#editor) to edit it.

### Editor
The editor page is where article content can be written. The editor is rich-text WSIWYG editor based on ProseMirror with support for many types of formatting, structuring, media and widget elements.

![Editor page.](/docs/images/editor/editor.png)

Rich elements supported include:

- Text formatting (bold, italic, underline, inline code, alignment, etc.)
- Images and media embeds (ex. YouTube videos)
  - Images can be hotlinked or uploaded to the site [file CMS](#files)
- Code blocks with syntax highlighting
- Admonitions/alerts (colored blocks for notes, warnings, tips)
- Nestable lists
- Footnotes
- Annotations for leaving comments and notes for other editors

The editor supports undo/redo, copy/paste and drag-and-drop, which also works for all rich content.

The editor features a toolbar for inserting rich content, which may also be done with configurable keyboard shortcuts or a context menu. The elements of the toolbar itself may also be customized in the editor settings to hide tools irrelevant to your type of articles.

A sidebar may be toggled to navigate large articles by their headings.

Within the `File -> Article properties` dropdown you may configure the article metadata, such as tags and scheduled publishing time.

While editing an article you may also choose to save it as a draft to save changes to the CMS without yet making them visible in the published site.

### Files
The files tab of the admin dashboard allows uploading files, mainly intended to upload images for use in articles or as branding & avatar assets for the site and editor accounts respectively, though you may upload any file type and link it in content.

![Files tab.](/docs/images/admin/files.png)

### Navigation
The navigation tab allows configuring the published site's navigation bar, creating links to your categories, pages or external sites. These navigation links may also be put in a "Group" to create dropdown menus for deeper navigation.

![Navigation tab.](/docs/images/admin/navigation.png)

### Configuration
The configuration tab allows configuring the branding of the site, such as the logo, favicon, title and theming from a selection of dasiyUI themes. Image assets must be uploaded to the [file CMS](#files) first.

![Configuration tab.](/docs/images/admin/config.png)

You may also configure which social networks are shown to share articles from the site.

### Published site
Articles are published to the public site at the frontend root (`/`), which is a server-side rendered site for fast loading and optimal SEO.

![Published site.](/docs/images/site/category.png)

The home page displays the latest articles from all categories, with summaries for them (either auto-generated or set in the article editor); the articles of a specific category are available at `/category/<category_name>` - you're recommended to create links to them from the navigation bar through the [site configuration panel](#configuration).

Articles are paginated, if ElasticSearch is enabled for the site, they may be searched by tags or author by clicking the relevant elements, or by text using the search bar, which supports search-as-you-type.

A sidebar can be added through the site configuration panel as well, supporting the same rich content as articles.

Article pages themselves are also server-side rendered and their content is displayed consistently with how it appeared in the editor. Content and metadata (author, date, tags) is also displayed. Each article also includes an author card at the end, which displays their biography and call-to-action button to search other articles they authored.

![Article page.](/docs/images/site/article.png)

Comments may be enabled on a per-article basis, and are displayed at the end of the article. They support limited markdown formatting (bold, italics, quotes) and support nested replies. Comments can be posted by readers logged in with Google SSO and editors may also reply to comments or delete them to moderate them.
Comments from site visitors are entirely anonymous - no personal data is stored.