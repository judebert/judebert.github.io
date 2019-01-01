---
layout: default
title: All Tags
permalink: "/progress/tag/"
---
<h1>All Tags</h1>
<ul class="tag-list">
{%- comment -%}
  Nobody tells you this, but each entry in "site.tags" is an array with two items.
  The first item is the tag's name. 
  The second item is a list of all the posts tagged with that tag.
{%- endcomment -%}
{%- assign sortedTags = site.tags | sort -%}
{%- for tag in sortedTags -%}
  <li>
    {%- assign tagname = tag | first -%}
    {%- assign tagslug = tagname | slugify -%}
    {%- assign posts = tag | last | reverse -%}
    {%- assign numposts = posts | size -%}
    <a id="{{ tagslug }}" href="/progress/tag/{{ tagslug }}">{{ tagname }}</a> ({{ numposts }})
    {%- if numposts > 0 -%}
    <ul>
    {%- for post in posts -%}
      <li><a href="{{ post.url | relative }}">{{ post.title }}</a></li>
    {%- endfor -%}
    </ul>
    {%- endif -%}
  </li>
{%- endfor -%}
</ul>
