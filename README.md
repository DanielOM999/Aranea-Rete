# Aranea-Rete - Google 2.0 Prototype

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)

A TF-IDF based web search engine alternative implementing advanced ranking algorithms while respecting web scraping ethics.

## Key Features
- **Intelligent Scraping**: 
  - Automatic robots.txt compliance checker
  - Domain whitelisting (Top 1M websites)
  - Resource filtering (images/media/stylesheets excluded)
- **Ranking Algorithms**:
  - TF-IDF weighted search results
  - Euclidean norm vectorization (cosine similarity)
  - Inverse indexing implementation
- **Scalable Architecture**:
  - Distributed task throttling system
  - Sequelize-based PostgreSQL storage
  - Horizontal scaling ready

## Database Schema
```sql
CREATE TABLE Websites (
  id UUID PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(2048) UNIQUE NOT NULL,
  word_count INT NOT NULL,
  rank INT NOT NULL
);

CREATE TABLE Keywords (
  id UUID PRIMARY KEY,
  word VARCHAR(45) UNIQUE NOT NULL,
  documents_containing_word BIGINT
);

CREATE TABLE website_keywords (
  keyword_id UUID NOT NULL,
  website_id UUID NOT NULL,
  position INT NOT NULL,
  occurrences INT NOT NULL,
  PRIMARY KEY (keyword_id, website_id, position),
  FOREIGN KEY (keyword_id) REFERENCES Keywords(id),
  FOREIGN KEY (website_id) REFERENCES Websites(id)
);
```

## Installation

### Prerequisites
- Docker 24.x+
- Node.js 18.x (only for development)
- 8GB+ RAM recommended

### Production Setup
```bash
# 1. Clone repository
git clone https://github.com/DanielOM999/Aranea-Rete.git && cd Aranea-Rete

# 2. Start services
docker-compose up --build -d

# 3. Verify operation
docker-compose ps
```
