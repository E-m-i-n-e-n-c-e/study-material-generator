Data is now modular: Passages are grouped by subject into four initial modules: Economics, Life Sciences, Physical Sciences, and Technology. This structure is easily expandable.

API has been simplified: We've reduced our API routes from five to three. The key changes are:

GET /api/modules: A new endpoint to fetch the list of available subject modules.

POST /api/passage/random: This updated endpoint now requires a module and difficulty in the request body to serve a relevant passage.

The submission endpoint (POST /api/submit) remains unchanged.

Why This Matters:

This new system allows users to select topics they're interested in, making the assessment more engaging. It also creates a scalable foundation for adding new content without further API changes.

Next Steps:

The frontend needs to be updated to implement the new user flow: first fetch the modules, then allow users to select one before requesting a passage. The submission logic requires no changes. All new endpoints are tested, validated, and ready for integration. Please review the updated documentation for details.