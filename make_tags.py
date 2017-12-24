#!/usr/bin/env python
import re

'''
tag_generator.py

Copyright 2017 Long Qian
Contact: lqian8@jhu.edu

This script creates tags for your Jekyll blog hosted by Github page.
No plugins required.
'''

import glob
import os

post_dir = '_posts/'
tag_dir = '_tagged/'

filenames = glob.glob(post_dir + '*html')

total_tags = []
for filename in filenames:
    f = open(filename, 'r')
    inyaml = False
    intaglist = False
    for line in f:
        if inyaml:
            candidate = line.strip()
            if intaglist:
              if candidate.startswith('-'):
                  total_tags.append(re.sub('^\s*-\s*', '', candidate).lower())
              else:
                  intaglist = False
                  inyaml = False
                  break
            elif candidate.startswith('tags:'):
                intaglist = True
        if line.strip() == '---':
            if not inyaml:
                inyaml = True
            else:
                inyaml = False
                break
    f.close()
total_tags = set(total_tags)

old_tags = glob.glob(tag_dir + '*.md')
for tag in old_tags:
    os.remove(tag)

for tag in total_tags:
    slug = re.sub('[-\s]+', '-', tag).strip().lower()
    tag_filename = tag_dir + slug + '.md'
    f = open(tag_filename, 'a')
    write_str = '---\nlayout: tagpage\ntitle: Posts tagged \"' + tag + '\"\ntag: ' + tag + '\nslug: ' + slug + '\nrobots: noindex\n---\n'
    f.write(write_str)
    f.close()
print("Tags generated, count", total_tags.__len__())
