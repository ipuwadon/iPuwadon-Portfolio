# AI readiness design note

Content access goes through `ContentRepository` and `SearchIndex` (`backend/app/content.py`). Planned extensions:

- **Embeddings:** an indexer reads `repo.list()`, chunks each body by heading, and stores embeddings in a vector store (pgvector in the existing PostgreSQL).
- **Semantic search:** implement `SearchIndex` with vector similarity and swap it in `main.py`. The content model and API stay unchanged.
- **RAG / Ask Puwadon AI:** a new `/api/ask` endpoint retrieves the top chunks from the index and calls an LLM with the chunks as context. Cite `type/slug` in answers.
