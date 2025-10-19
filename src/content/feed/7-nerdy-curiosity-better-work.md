---
title: "How My Nerdy Curiosity Makes My Work Better"
description: "A story about my recent client work, where a deep dive into linguistics proved that fundamental curiosity is the best SEO tool."
publishDate: "2025-10-17"
contentModifiedDate: "2025-10-17"
order: 7
---

## The Feeling

I have a long-term client for whom I do tech SEO. Recently, we've been trying to improve their presence in AI Overviews, and we landed on a brilliant idea from their Head of Content:

> We have transcripts of every sales call. We should be pulling the customer questions directly from those transcripts to use in our blog FAQs.

It was a very cool idea. We had over 400 existing blog articles and a huge list of potential questions from multiple sources: the articles' existing FAQs, the new sales call transcripts, and - my own addition - real user queries from Google Search Console (fortunately, I had set up a bulk export from GSC to BigQuery, which made analysis easy).

To match the articles to the most relevant questions, I designed an AI matching system using embeddings and cosine similarity. I was ready to go.

Then the client sent me the final, combined list of about 5,000 questions. And as I looked at it, I felt something... _odd_.

The Head of Content had constantly been asking before,

> How can we be sure our questions are good?

and now, looking at this list, his question echoed in my mind. I had a feeling these questions were _not_ good. But a feeling isn't a good argument for a client. I needed proof.

## The Rabbit Hole

So, in a moment of what felt like pure childlike curiosity, I opened a chat with an AI and asked a ridiculously simple question:

> What _is_ a question?

And just like that, I was gone.

I fell headfirst into a deep-dive rabbit hole on the Theory of Questions. I was like a school student again, watching YouTube lectures on English grammar, sketching out my findings on a Milanote board, and asking an AI to explain linguistic concepts. It was _so much fun_.

I learned about **auxiliary** verbs, **interrogative** words, and the wonderfully nerdy concept of **modality** ("Epistemic" vs. "Deontic"). And through it all, a hypothesis started to form: for SEO and AI search, it seemed like **interrogative questions** (starting with _who, what, where, when, why, how_) would be far more powerful than simple **yes/no questions** (starting with _is, are, do, can_).

## The Proof in the Data

An AI chat agreed with my hypothesis, but again, that's not proof. I needed real data.

And that's when my GSC-to-BigQuery export came in handy again. I asked an AI to help me write an SQL query to analyze the performance of all the question-like queries from Google Search Console, broken down by type: interrogative vs. yes/no.

The result was staggering. The data was undeniable.

**Interrogative questions got 23 times more impressions than simple yes/no questions.**

I had found it. The real, data-backed proof.

## The Realization

Suddenly, I knew what was wrong with that list of 5,000 questions. I went back and checked. Just as I'd suspected, about half of them were the low-impact "yes/no" type. My feeling wasn't just a feeling; it was my brain recognizing a pattern I hadn't yet found the language for.

I presented my discovery to the client's team - the problem, the rabbit hole of linguistic research, and the undeniable proof from their own data. They loved it.

We're now in the process of rewriting the questions, armed with this new understanding. It's a powerful reminder that the biggest breakthroughs often come not from the most complex code, but from the simplest questions. That deep, nerdy curiosity isn't a bug in my process; it's the **feature that makes my work better.**
