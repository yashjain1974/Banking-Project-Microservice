# Spring_Annotations
# Git Command Cheat Sheet

This guide provides a quick reference to the most common Git commands for everyday use.

### 1. Initial Git Setup (First-time configuration)

Before you start, configure your Git username and email. This is done only once per computer.

| Action | Command |
| :--- | :--- |
| **Set your username** | `git config --global user.name "Your Name"` |
| **Set your email** | `git config --global user.email "youremail@example.com"` |

### 2. Starting a New Project

Use these commands when you are creating a new project from scratch on your local machine.

| Action | Command |
| :--- | :--- |
| **Initialize a new Git repository** | `git init` |
| **Check the status of your files** | `git status` |
| **Add a file to the staging area** | `git add <file_name>` or `git add .` (for all files) |
| **Commit your staged changes** | `git commit -m "Your descriptive commit message"` |

### 3. Connecting to a Remote Repository

After creating a project locally, use these commands to connect it to a remote server like GitHub.

| Action | Command |
| :--- | :--- |
| **Add a remote repository** | `git remote add origin <repository_url>` |
| **Verify the remote repository** | `git remote -v` |
| **Push your local commits to the remote** | `git push -u origin main` (or `master`) |

### 4. Collaborating on an Existing Project

Use these commands when you are joining a project that already exists on a remote server.

| Action | Command |
| :--- | :--- |
| **Clone (download) a remote repository** | `git clone <repository_url>` |
| **Fetch changes from remote & merge them** | `git pull origin main` (or the specific branch name) |

### 5. Working with Branches

Branches allow you to work on different features or fixes in isolation without affecting the main codebase.

| Action | Command |
| :--- | :--- |
| **List all local branches** | `git branch` |
| **Create a new branch** | `git branch <branch_name>` |
| **Switch to a different branch** | `git checkout <branch_name>` |
| **Create and switch to a new branch** | `git checkout -b <new_branch_name>` |
| **Delete a local branch** | `git branch -d <branch_name>` |
| **Push a new branch to remote**| `git push origin <branch_name>` |

### 6. Merging Branches

Once your work in a branch is complete, you can merge it into another branch (e.g., `main`).

| Action | Command |
| :--- | :--- |
| **Switch to the destination branch** | `git checkout main` |
| **Merge your feature branch into main** | `git merge <feature_branch_name>` |

### 7. Stashing Work

Stashing temporarily saves your uncommitted changes so you can switch branches without committing incomplete work.

| Action | Command |
| :--- | :--- |
| **Stash your current changes** | `git stash` |
| **List all your stashes** | `git stash list` |
| **Apply the most recent stash and remove it** | `git stash pop` |
| **Apply a specific stash** | `git stash apply stash@{n}` (e.g., `stash@{2}`) |
| **Clear all stashes** | `git stash clear` |

### 8. Undoing Changes

Sometimes you need to revert your work. Be careful with these commands.

| Action | Command |
| :--- | :--- |
| **Create a new commit that undoes a previous commit** | `git revert <commit_hash>` |
| **Unstage a file** | `git reset HEAD <file_name>` |
| **Reset to a previous commit (soft)** | `git reset --soft <commit_hash>` (Keeps your changes) |
| **Reset to a previous commit (hard)** | `git reset --hard <commit_hash>` (**Deletes** all changes since the commit) |