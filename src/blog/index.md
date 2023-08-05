---
layout: layouts/base.njk
eleventyNavigation:
  key: blog
---
# Blog


<aside>
  {%- for post in collections.post -%}
  <article>
    <a href="{{ post.url }}"><h2>{{ post.data.title }}</h2></a>
    <p>{{ post.data.excerpt }}</p>
  </article>
  {%- endfor -%}
</aside>
