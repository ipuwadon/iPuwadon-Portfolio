---
title: Oracle Query Tuning Basics
kind: technical-write-up
date: 2024-03-10
summary: Practical notes on reading Oracle execution plans.
category: Oracle
tags: [oracle, sql]
---

Start with the execution plan.

```sql
EXPLAIN PLAN FOR SELECT * FROM policies WHERE status = 'ACTIVE';
```
