# Publishing

The intended owner is `vigneshiyergithub`, repository `section-notes`.
The prepared checkout uses `main` and an `origin` pointing to
`https://github.com/vigneshiyergithub/section-notes.git`.

From the repository root, after reviewing the files and choosing to publish:

```sh
npm ci
npm run verify
npm run package
gh repo create vigneshiyergithub/section-notes --public --description "Local-first Chrome extension for website annotations and shareable screenshot reviews"
git push -u origin main
```

These commands create a public repository. The preparation process does not run
them. If a repository already exists, skip creation and confirm its origin before
pushing.

After the first push:

- Confirm the Verify and package workflow passes.
- Optionally enable private vulnerability reporting in repository settings.
- Create a GitHub release and attach `dist/section-notes-v1.4.0.zip` if desired.
  The default workflow uploads a build artifact but does not publish a release.
- Test the release ZIP by extracting it and loading `section-notes/` unpacked.

There is no Chrome Web Store submission or signing automation in this repository.
