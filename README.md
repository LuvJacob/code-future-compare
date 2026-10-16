# Code Future Compare

Build a functional MVP called "From English to Executable: AI in the Programming Language Loop" for my university Programming Languages course (CSC 4330).

GOAL:

Create an educational coding experiment that compares traditional 2016 programming workflows against AI-assisted 2026 programming workflows.

TECH STACK:

Next.js, React, TypeScript, Tailwind CSS. No database, authentication, paid services, or external APIs for this first version.

FEATURES:

1. Modern landing page with project description and Start Experiment button.

2. Two workflow modes: Traditional Programming (2016) and AI-Assisted Programming (2026).

3. Two simple programming problems, such as Reverse a String and Find the Maximum in an Array. Display clear instructions and expected input/output examples.

4. Code-entry area with JavaScript syntax highlighting if practical.

5. Functional 10-minute countdown timer for each challenge.

6. Traditional Mode: coding problem and editor, with no AI assistant.

7. AI Mode: the same type of workspace with an AI assistant sidebar. For now it should display predefined educational hints clearly labeled "Demo hints — Gemini API integration planned." Do not pretend that this is a real AI service.

8. Buttons for Start, Record Attempt, Mark Complete, and Did Not Finish. Make them functional.

9. Results dashboard showing mode, problem, elapsed time, attempt count, and completion status.

10. Store results in localStorage to preserve them on page refresh.

IMPORTANT:

Prioritize functional navigation, timers, state tracking, and realistic experiment design over complex backend infrastructure. Use a clean professional academic UI. Do not fake participant data, AI responses, code execution, or test results. Clearly label any unimplemented functionality. Deliver a runnable MVP suitable for a short classroom demonstration. No Gemini API needed yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f5e05dc0-c72e-476c-ad0e-814bb39a2715).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
