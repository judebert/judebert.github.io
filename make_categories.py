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

hierarchy = {}
hierarchy['Madness'] = ['Lunatic Ravings', 'News', 'Submissions']
hierarchy  ['Lunatic Ravings'] = ['Civilization', 'Politics', 'Religion', 'Wonder']
hierarchy    ['Civilization'] = []
hierarchy    ['Politics'] = []
hierarchy    ['Religion'] = []
hierarchy    ['Wonder'] = []
hierarchy  ['News'] = ['Activities', 'EV', 'Family', 'Programming']
hierarchy    ['Activities'] = ['Web Activities']
hierarchy      ['Web Activities'] = []
hierarchy    ['EV'] = []
hierarchy    ['Family'] = ['Eri', 'Nathan', 'Tatiana']
hierarchy      ['Eri'] = []
hierarchy      ['Nathan'] = []
hierarchy      ['Tatiana'] = []
hierarchy    ['Programming'] = []
hierarchy  ['Submissions'] = []
hierarchy['Method'] = ['Art', 'EV Conversion Diary', 'Gallery of Wasted Potential', 'Humor', 'Programs', 'Stories', 'The Attic', 'Tutorials']
hierarchy  ['Art'] = []
hierarchy  ['EV Conversion Diary'] = []
hierarchy  ['Gallery of Wasted Potential'] = []
hierarchy  ['Humor'] = []
hierarchy  ['Programs'] = ['Java', 'Palm']
hierarchy    ['Java'] = ['Christmas Roundup', 'Pawns']
hierarchy      ['Christmas Roundup'] = []
hierarchy      ['Pawns'] = []
hierarchy    ['Palm'] = ['Contraction Timer', 'Roshambo']
hierarchy      ['Contraction Timer'] = []
hierarchy      ['Roshambo'] = []
hierarchy  ['Stories'] = []
hierarchy  ['The Attic'] = []
hierarchy  ['Tutorials'] = []
def normalize_tags(tag):
  result = []
  for key in hierarchy[tag]:
    result.extend(normalize_tags(key))
  result.insert(0, tag)
  return result
category_tags = {}
for key in hierarchy:
  category_tags[key] = ', '.join(normalize_tags(key))


post_dir = '_posts/'
tag_dir = '_categorized/'

filenames = glob.glob(post_dir + '*html')

total_tags = []
for filename in filenames:
    f = open(filename, 'r')
    inyaml = False
    intaglist = False
    file_tags = []
    for line in f:
        if inyaml:
            candidate = line.strip()
            if intaglist:
              if candidate.startswith('-'):
                  file_tags.append(re.sub('^\s*-\s*', '', candidate))
              else:
                  intaglist = False
                  inyaml = False
                  break
            elif candidate.startswith('categories:'):
              intaglist = True
              if '[' in candidate and '[]' not in candidate:
                print "Edge case category in ", filename, ": ", candidate
        if line.strip() == '---':
            if not inyaml:
                inyaml = True
            else:
                inyaml = False
                break
    f.close()
    if len(file_tags) > 1:
      print filename, " has ", len(file_tags), " categories: ", file_tags
    total_tags.extend(file_tags)
total_tags = set(total_tags)

old_tags = glob.glob(tag_dir + '*.md')
for tag in old_tags:
    os.remove(tag)

for tag in total_tags:
    slug = re.sub('[-\s]+', '-', tag).strip().lower()
    tag_filename = tag_dir + slug + '.md'
    f = open(tag_filename, 'a')
    write_str = """---
layout: categorypage
title: Posts in category "%s"
tag: %s
slug: %s
categories: [%s]
robots: noindex
---""" % (tag, tag, slug, category_tags[tag])
    f.write(write_str)
    f.close()
print("Tags generated, count", total_tags.__len__())
