# Ringer

My first React app. A simple but addictive puzzle game.

Tapping a cell flips the ring around it (all its neighbors, both orthogonal and diagonal).
The whole board is a ring (technically, a torus), too: cells on the edge have neighbors on the opposite edge!
 
Choose board sizes from 5x5 to 12x12, ring cycles from 2 to 5, shuffles from 0 to half-the-board,
and multiple icon sets. All handled in React Javascript, HTML, and CSS.

## References

I used  [StackOverflow instructions to copy the Git repository from the original React app](https://stackoverflow.com/questions/1683531/how-to-import-existing-git-repository-into-another/43345686#43345686).

### Adding a React app to your Jekyll website
I [used instructions from blandersoft](https://www.blandersoft.com/short/create-react-jekyll/)
to move my app into my website.

I made an `apps/` directory to keep *all* my projects in, so instead of adding each one to the Jekyll
`_config.yml` file I just added `- apps`.

I had to merge my `.gitignore` files, while meant adding a lot of `/apps/*/whatever` to each of the React ignores.

The React homepage was the same, at least! Once I've got it working as a Jekyll page,
I'll explore subdomains and redirects.

Locally, I could run with `npm start`.

Instead of piping `echo` to `cat` to create the index file, I had the purge npm script
(which I very reasonably named "stage") copy the generated index file into `_includes/app/ringer.html`,
then created `ringer/index.md` with the frontmatter contents and an include:
```
---
layout: null
---
{% include app/ringer.html %}
```

Careful with the file name! If you use index.html, it'll get overwritten with the npm deployment.
I'm not sure what would happen if you went with something like ringer.html;
then the React index.html would still exist. But it's not supposed to be deployed,
because it has no frontmatter. Mystery.

Anyways, `npm run deploy` did all the building and copying, then `bundle exec jekyll serve` built
the website and let me run my React app at `localhost:4000/ringer/`.
