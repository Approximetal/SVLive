import { useSettings } from '@src/settings.mjs';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function WelcomeTab({ context }) {
  const { fontFamily } = useSettings();
  return (
    <div className="prose dark:prose-invert min-w-full pt-2 font-sans pb-8 px-4 " style={{ fontFamily }}>
      <h3>꩜ welcome to strudel AI</h3>
      <p>
        You have found <span className="underline">strudel AI</span>, an AI-powered fork of the Strudel live coding
        platform! This version integrates Anthropic's Claude to help you write, modify, and perform music in real-time.
      </p>

      <h3>🤖 AI features</h3>
      <p>
        Open the <span className="font-bold text-purple-400">AI</span> tab to get started. Configure your API key in{' '}
        <span className="font-bold text-purple-400">Settings → AI Configuration</span>.
      </p>
      <ul>
        <li>
          <strong>Generate:</strong> Create full tracks from descriptions like "dark techno at 130bpm". The AI
          automatically detects your intent and builds genre-specific prompts.
        </li>
        <li>
          <strong>Modify:</strong> Evolve your code with commands like "add reverb to the snare" or "drop the bass".
        </li>
        <li>
          <strong>AI DJ:</strong> Let the autonomous agent perform your track, queuing changes and transitions
          automatically.
        </li>
        <li>
          <strong>Alternatives:</strong> Get multiple variations for any generation — compare and pick the one you like
          best.
        </li>
        <li>
          <strong>Sound Validation:</strong> The AI validates that all samples and synths used in generated code actually
          exist in Strudel.
        </li>
      </ul>

      <h3>🎵 examples</h3>
      <p>
        Check out the <span className="font-bold text-purple-400">Examples</span> tab for a curated library of genre
        demos — from techno and house to jazz, ambient, and afrobeat. Click any example to load and play it instantly.
      </p>

      <h3>🚀 quick start</h3>
      <ol>
        <li>
          Go to <strong>Settings</strong> → paste your API key under <em>AI Configuration</em>
        </li>
        <li>
          Open the <strong>AI</strong> tab → type a prompt like "ambient drone with evolving textures"
        </li>
        <li>Hit Generate → tweak, evolve, or let the AI DJ take over!</li>
      </ol>

      <h3>꩜ learning</h3>
      <p>
        To learn the basics of Strudel code, check out the{' '}
        <a href={`${baseNoTrailing}/workshop/getting-started/`} target="_blank">
          interactive tutorial
        </a>
        .
      </p>

      <h3>꩜ about</h3>
      <p>
        This is a fork of{' '}
        <a href="https://strudel.cc/" target="_blank">
          Strudel
        </a>
        , a JavaScript version of{' '}
        <a href="https://tidalcycles.org/" target="_blank">
          TidalCycles
        </a>
        .
        <br />
        <br />
        Original Strudel is free/open source software available on{' '}
        <a href="https://github.com/tidalcycles/strudel" target="_blank">
          GitHub
        </a>
        .
        <br />
        This AI fork is also open source.
      </p>
    </div>
  );
}
