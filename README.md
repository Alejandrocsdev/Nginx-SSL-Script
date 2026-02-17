# Nginx Script

```
.
├── domain.json			# Domain configuration
├── run.sh						# Entrypoint (loads nvm + runs with sudo)
└── src
    ├── index.js				# CLI entry
    ├── deploy.js			# Deployment logic
    ├── remove.js			# Removal logic
    ├── template.txt		# Nginx template
    └── utils.js				# Validation helpers
```