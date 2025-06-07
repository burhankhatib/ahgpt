# 🤝 Contributing to Al Hayat GPT

Thank you for your interest in contributing to Al Hayat GPT! This guide will help you get started with contributing to our Christian AI chatbot project.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features and improvements
- 💻 **Code Contributions**: Submit bug fixes and new features
- 📚 **Documentation**: Improve our documentation and guides
- 🌍 **Translations**: Help translate the interface to more languages
- 🧪 **Testing**: Help test new features and report issues

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Git** for version control
- **Sanity Studio** account
- **Clerk** account for authentication
- **OpenAI** API key

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ahgpt.git
   cd ahgpt
   ```

2. **Set Up Upstream Remote**
   ```bash
   git remote add upstream https://github.com/burhankhatib/ahgpt.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # OpenAI
   OPENAI_API_KEY=sk-your-key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
   CLERK_SECRET_KEY=sk_test_your-key
   
   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   SANITY_API_TOKEN=your-token
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Verify Setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - Test chat functionality
   - Verify admin dashboard access

## 📋 Development Guidelines

### Code Style

We use **ESLint** and **Prettier** for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Coding Standards

- **TypeScript**: Use TypeScript for type safety
- **Functional Components**: Prefer functional components with hooks
- **Naming Convention**: Use camelCase for variables, PascalCase for components
- **File Structure**: Keep related files organized in appropriate directories

### Component Guidelines

```typescript
// Good component structure
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
    title: string;
    isActive?: boolean;
    onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({
    title,
    isActive = false,
    onAction
}) => {
    return (
        <div className={cn(
            "base-styles",
            isActive && "active-styles"
        )}>
            <h2>{title}</h2>
            {onAction && (
                <button onClick={onAction}>
                    Action
                </button>
            )}
        </div>
    );
};
```

### CSS & Styling

- **Tailwind CSS**: Use Tailwind utilities first
- **CSS Modules**: For complex component-specific styles
- **Consistent Spacing**: Use Tailwind spacing scale
- **Responsive Design**: Mobile-first approach

```css
/* Use Tailwind utilities */
.button {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
}

/* Component-specific styles when needed */
.custom-component {
    /* Custom styles that can't be achieved with Tailwind */
}
```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names:

```bash
# Features
git checkout -b feature/user-authentication
git checkout -b feature/chat-export

# Bug fixes
git checkout -b fix/message-rendering
git checkout -b fix/mobile-responsiveness

# Documentation
git checkout -b docs/api-reference
git checkout -b docs/deployment-guide
```

### Commit Messages

Follow conventional commit format:

```bash
feat: add user authentication with Clerk
fix: resolve chat message rendering issue
docs: update API documentation
style: improve button hover animations
refactor: simplify chat context logic
test: add unit tests for message component
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, tested code
   - Follow our coding standards
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run build
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use our PR template
   - Provide clear description
   - Include screenshots if UI changes
   - Reference related issues

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Local testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Screenshots (if applicable)
Include screenshots for UI changes

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design verified
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test ComponentName.test.tsx
```

### Testing Guidelines

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

```typescript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

describe('ChatMessage', () => {
    it('renders user message correctly', () => {
        render(
            <ChatMessage
                message={{
                    role: 'user',
                    content: 'Hello, AI!',
                    timestamp: new Date()
                }}
            />
        );

        expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
        expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('handles copy message action', () => {
        const mockCopy = jest.fn();
        // Test copy functionality
    });
});
```

## 🌍 Internationalization

### Adding New Languages

1. **Create Language File**
   ```json
   // src/locales/es.json
   {
     "chat": {
       "placeholder": "Escribe tu mensaje...",
       "send": "Enviar",
       "welcome": "¡Hola! ¿Cómo puedo ayudarte?"
     },
     "auth": {
       "signIn": "Iniciar Sesión",
       "signUp": "Registrarse"
     }
   }
   ```

2. **Update Language Configuration**
   ```typescript
   // src/lib/i18n.ts
   export const supportedLanguages = {
     en: 'English',
     es: 'Español',
     ar: 'العربية',
     // Add new language
   };
   ```

3. **Test Translation**
   - Verify UI elements translate correctly
   - Test RTL languages (Arabic, Hebrew)
   - Ensure proper text overflow handling

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test on latest version** to ensure bug still exists
3. **Gather information** about your environment

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 118]
- Device: [e.g., iPhone 14, Desktop]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Mockups, examples, or references
```

## 📚 Documentation

### Documentation Standards

- **Clear and Concise**: Use simple, understandable language
- **Code Examples**: Provide practical examples
- **Screenshots**: Include visuals for UI documentation
- **Keep Updated**: Update docs with code changes

### Documentation Structure

```markdown
# Title
Brief description

## Overview
What this document covers

## Prerequisites
What's needed before starting

## Step-by-step Guide
1. First step
2. Second step

## Examples
Practical examples

## Troubleshooting
Common issues and solutions

## Related Documentation
Links to related docs
```

## 🔐 Security

### Security Guidelines

- **No Hardcoded Secrets**: Use environment variables
- **Input Validation**: Validate all user inputs
- **Authentication**: Properly implement auth flows
- **XSS Prevention**: Sanitize HTML content
- **CSRF Protection**: Implement CSRF tokens

### Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Email security issues to: security@alhayatgpt.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 🎯 Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation needs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority issue
- `status: in progress` - Currently being worked on

## 🏆 Recognition

### Contributors

We recognize contributors in several ways:

- **Contributors List**: Listed in README
- **Release Notes**: Mentioned in changelogs
- **Social Media**: Highlighted on our channels
- **Special Recognition**: For significant contributions

### Hall of Fame

Outstanding contributors may be invited to join our core team and get:

- **Direct commit access**
- **Influence on project direction**
- **Special recognition badge**
- **Priority support for their projects**

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and features
- **Email**: contribute@alhayatgpt.com

### Development Support

- **Technical Questions**: Use GitHub Discussions
- **Code Review**: Submit PRs for feedback
- **Architecture Decisions**: Discuss in issues

## 📄 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect
- **Be Inclusive**: Welcome people of all backgrounds
- **Be Collaborative**: Work together constructively
- **Be Professional**: Maintain professional conduct

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information
- Spam or off-topic content

### Enforcement

Violations may result in:
- Warning
- Temporary suspension
- Permanent ban

Report violations to: conduct@alhayatgpt.com

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Al Hayat GPT! Together, we're building something amazing for the Christian community. 🙏 