#!/usr/bin/env python
import re
import yaml

import glob
import os

post_dir = '_posts/'
category_dir = '_categorized/'

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

filenames = glob.glob(post_dir + '*html')

all_post_categories = []
# Add all categories, even if they're empty
for key in hierarchy:
    all_post_categories.append(key)
# Add all the categories in all the posts
#for filename in filenames:
#    f = open(filename, 'r')
#    docs = yaml.safe_load_all(f)
#    post_data = next(docs)
#    file_categories = post_data['categories']
#    all_post_categories.extend(file_categories)
#    f.close()
#all_post_categories = set(all_post_categories)

old_category_files = glob.glob(category_dir + '*.md')
for category_file in old_category_files:
    os.remove(category_file)

for cat in all_post_categories:
    slug = re.sub('[-\s]+', '-', cat).strip().lower()
    cat_filename = category_dir + slug + '.md'
    f = open(cat_filename, 'a')
    write_str = '''---
layout: categorypage
title: Posts with category "{cat}"
tag: {cat}
slug: {slug}
categories: [{children}]
permalink: /progress/category/{slug}
robots: noindex
---'''.format(cat=cat, slug=slug, children=category_tags[cat])
    f.write(write_str)
    f.close()
print("Category pages generated, count", all_post_categories.__len__())
