import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Tooltip } from '../src/components/Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouseenter after delay', async () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me').parentElement!;
    fireEvent.mouseEnter(trigger);

    // Tooltip should not be visible immediately
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();

    // Advance timers past the delay
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('hides tooltip on mouseleave', async () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Tooltip text" delay={50}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me').parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(trigger);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();

    // Hide tooltip
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('respects custom delay prop', async () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Custom delay tooltip" delay={500}>
        <span>Trigger</span>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger').parentElement!;
    fireEvent.mouseEnter(trigger);

    // Should not appear after 200ms (less than the 500ms delay)
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Custom delay tooltip')).not.toBeInTheDocument();

    // Should appear after the full 500ms delay
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Custom delay tooltip')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('uses default delay of 200ms', async () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Default delay">
        <span>Trigger</span>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger').parentElement!;
    fireEvent.mouseEnter(trigger);

    // Should not appear before 200ms
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText('Default delay')).not.toBeInTheDocument();

    // Should appear at or after 200ms
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText('Default delay')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('clears timeout when mouse leaves before delay completes', async () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Never shown" delay={500}>
        <span>Trigger</span>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger').parentElement!;

    // Enter then immediately leave
    fireEvent.mouseEnter(trigger);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.mouseLeave(trigger);

    // Even after the full delay, tooltip should not be shown
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText('Never shown')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
