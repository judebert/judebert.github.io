#!/usr/bin/env python
import re
import yaml
from collections import Counter
import glob
import os
import math

post_dir = '_posts/'
tag_dir = '_tagged/'
tagcloud_filename = '_includes/tag_cloud.html'

filenames = glob.glob(post_dir + '*html')

total_tags = []
for filename in filenames:
    f = open(filename, 'r')
    docs = yaml.safe_load_all(f)
    post_info = next(docs)
    total_tags.extend(post_info['tags'])
    f.close()
freqs = Counter(total_tags)
total_tags = set(total_tags)

existing_tagfiles = glob.glob(tag_dir + '*.md')
for tagfile in existing_tagfiles:
    os.remove(tagfile)

for tag in total_tags:
    slug = re.sub('[-\s]+', '-', tag).strip().lower()
    tag_filename = tag_dir + slug + '.md'
    f = open(tag_filename, 'a')
    front_matter = '''---
layout: tagpage
title: Posts tagged "{tag}"
tag: {tag}
slug: {slug}
robots: noindex
permalink: /progress/tag/{slug}
---
'''.format(tag=tag, slug=slug)
    f.write(front_matter)
    f.close()
print("Tag pages generated, count", total_tags.__len__())

f = open(tagcloud_filename, 'w')
f.write('<div class="tag-cloud">')
maxcount = max(freqs.values())
first = True;
for tag, postcount in sorted(freqs.iteritems()):
  factor = math.log(maxcount)
  size = 100 * (math.log(postcount) / factor) + 100
  slug = re.sub('[-\s]+', '-', tag).strip().lower()
  if (first):
    first = not first;
  else:
    f.write(' &bull; ');
  f.write('<span style="font-size:{size}%"><a href="/progress/tag/{slug}">{tag}({count})</a></span>'
    .format(tag=tag, size=size, slug=slug, count=postcount))
f.write('</div>')
print("Generated tag cloud")
