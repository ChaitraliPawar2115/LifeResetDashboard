# Life Reset Dashboard 🌿

## 1. Project Introduction

Life Reset Dashboard is a personal productivity website designed to help users build healthy habits, manage daily tasks, track their moods, and improve their daily routine.

The website provides a simple and peaceful interface to organize everyday activities and monitor personal progress.

## 2. Objectives

- Track daily habits and completion progress.
- Manage daily tasks.
- Record moods and view mood history.
- Use a focus timer for study or work sessions.
- Track sleep hours and view a weekly sleep graph.
- Save user data in the browser.

## 3. Technologies Used

- **HTML5:** Creates the structure of the website.
- **CSS3:** Designs the layout, colours, and styling.
- **JavaScript:** Adds interactive features and functionality.
- **Local Storage:** Saves user data in the browser.
- **Git:** Tracks changes in the project.
- **GitHub:** Stores the project repository online.

## 4. Features

- Personal productivity dashboard.
- Daily habit tracker with progress messages.
- Motivational quotes.
- Daily task management.
- Mood selection and mood history.
- Focus timer with Start, Pause, and Reset controls.
- Sleep tracker with a seven-day graph and 30-day history.
- Dark mode.
- Browser-based data storage.

## 5. Major Changes and Git Commits

The following changes were made and recorded using Git:

| Change | Commit Message |
|---|---|
| Initial website creation | Initial commit: Life Reset Dashboard |
| Added rotating motivational quotes | Add rotating motivational quotes |
| Added dynamic habit progress messages | Add dynamic habit progress messages |
| Added mood history tracking | Add mood history tracking |
| Added focus timer controls | Add focus timer with controls |
| Added sleep tracking and weekly graph | Add sleep tracker with weekly graph |

## 6. Git and GitHub Workflow

Git was used for version control, and GitHub was used to host the repository.

The workflow included:

1. Initializing a Git repository.
2. Adding project files.
3. Creating commits for important changes.
4. Connecting the local repository to GitHub.
5. Pushing changes to the remote repository.

Common Git commands used:

```bash
git add .
git commit -m "Describe your change"
git push
git log --oneline
```

## 7. How to Run the Project

1. Clone or download the GitHub repository.
2. Open the `LifeResetDashboard` folder in Visual Studio Code.
3. Open `index.html` in a web browser, or use the Live Server extension.
4. Use the dashboard features through the website.

## 8. DevOps Tool Integration

**Tool used:** GitHub Actions

GitHub Actions was integrated to automatically check the project whenever changes are pushed to the `main` branch.

### Integration Steps

1. Created the `.github/workflows` directory.
2. Created the `ci.yml` workflow file.
3. Configured the workflow to run on pushes and pull requests to the `main` branch.
4. Added a step to check that `index.html`, `style.css`, `script.js`, and `README.md` exist.
5. Added a JavaScript syntax check using Node.js.
6. Committed and pushed the workflow to GitHub.
7. Verified that the workflow completed successfully with a green check mark.

### Workflow Result

The workflow ran successfully and confirmed that the required website files exist and the JavaScript syntax check passed.

## 9. Screenshots and Evidence

The following screenshots document the project development and DevOps integration:

1. **Website:** Screenshot of the Life Reset Dashboard interface.
2. **Git Commit History:** Screenshot showing the project commits using `git log --oneline`.
3. **GitHub Repository:** Screenshot showing the project files on GitHub.
4. **GitHub Actions:** Screenshot showing the successful CI workflow run.

Screenshots should be saved in a folder named `LifeResetDashboard_Screenshots` and included with the submission if required by the instructor.
## 10. GitHub Repository

Repository link: https://github.com/ChaitraliPawar2115/LifeResetDashboard

## 11. Conclusion

Life Reset Dashboard combines productivity and personal routine tracking in one website. Git and GitHub were used to manage project versions and maintain a history of development changes.
