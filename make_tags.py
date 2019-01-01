#!/usr/bin/env python
import re
import yaml

import glob
import os

post_dir = '_posts/'
tag_dir = '_tagged/'

filenames = glob.glob(post_dir + '*html')

total_tags = []
for filename in filenames:
    f = open(filename, 'r')
    docs = yaml.safe_load_all(f)
    post_info = next(docs)
    total_tags.extend(post_info['tags'])
    f.close()
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
print("Tags generated, count", total_tags.__len__())
