-- Phase 1 - Chapter 12 Status Calculation Rules support

alter table projects
  add column if not exists delayed_since timestamptz;
