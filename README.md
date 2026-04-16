# Reddit Real-Time Analytics Dashboard

## Overview

This project is a Node.js application built with Express that fetches, processes, and streams Reddit data in real time. It exposes REST endpoints for retrieving subreddit posts and provides a live streaming interface using Server-Sent Events (SSE).

The system performs data extraction and transformation, including engagement scoring and text parsing (hashtags and mentions), and serves a lightweight frontend dashboard.

---

## Architecture

- Backend: Node.js, Express
- Data Source: Reddit public JSON API
- HTTP Client: Axios
- Real-time Communication: Server-Sent Events (SSE)
- Frontend: Static HTML, CSS, JavaScript

---

## Features

- REST API for retrieving subreddit posts
- Real-time streaming of new posts via SSE
- Engagement score computation based on:
  - Upvotes
  - Comments
  - Upvote ratio
- Hashtag and mention extraction from post content
- Static dashboard for visualization

---

## Project Structure
