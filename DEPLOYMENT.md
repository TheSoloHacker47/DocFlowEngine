# Deployment Documentation

This document outlines the deployment process for the PDF to Word Converter application.

## Overview

The application is deployed on [Vercel](https://vercel.com) and is connected to the GitHub repository. Deployments are handled automatically by Vercel's CI/CD pipeline.

## Branches

-   **main**: This is the production branch. Any code merged into `main` will be automatically deployed to the production environment.
-   **develop**: This is the staging branch. Any code merged into `develop` will be automatically deployed to a staging environment.
-   **feature/\***: These are feature branches. Any pull request created from a feature branch will generate a preview deployment on Vercel.

## Deployment Process

1.  **Create a feature branch**: All new work should be done on a feature branch.
2.  **Open a pull request**: When the feature is complete, open a pull request against the `develop` branch.
3.  **Code review**: The pull request will be reviewed by the team.
4.  **Merge to develop**: Once the pull request is approved, it will be merged into the `develop` branch. This will trigger a deployment to the staging environment.
5.  **Test on staging**: The feature will be tested on the staging environment.
6.  **Merge to main**: Once the feature has been verified on staging, the `develop` branch will be merged into the `main` branch. This will trigger a deployment to the production environment.

## Rollbacks

Vercel makes rollbacks easy. If a deployment introduces a critical bug, you can instantly roll back to a previous deployment from the Vercel dashboard.

## Environment Variables

The application requires the following environment variables to be set in the Vercel dashboard:

-   `NEXT_PUBLIC_SITE_URL`
-   `GOOGLE_ANALYTICS_ID`
-   `ADSENSE_CLIENT_ID`
-   `SENTRY_DSN` (if using Sentry) 