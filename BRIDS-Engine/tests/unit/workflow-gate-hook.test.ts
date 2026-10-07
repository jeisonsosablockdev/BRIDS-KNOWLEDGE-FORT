import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { VaultGateway } from '../../core/vault-gateway.ts';
import { TaskOrchestrator } from '../../core/orchestrator.ts';
import {
  evaluatePreToolUse,
  evaluateStopHook,
} from '../../scripts/sdd/workflow-gate-hook.ts';

describe('SPEC-HOOK-004: Deterministic PreToolUse & Stop Hooks (3-Role Multi-Agent Gates)', () => {
  let tempRoot: string;
  let specsDir: string;
  let vault: VaultGateway;
  let orchestrator: TaskOrchestrator;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brids-hook-test-'));
    specsDir = path.join(tempRoot, '00 Inbox', 'Specs');
    fs.mkdirSync(specsDir, { recursive: true });
    vault = new VaultGateway(tempRoot);
    orchestrator = new TaskOrchestrator(vault);
  });

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('@spec REQ-HOOK-401: should force RequestFeedback=false on artifact write_to_file calls to prevent auto-proceed', () => {
    const res = evaluatePreToolUse(
      {
        artifactDirectoryPath: '/Users/test/.gemini/antigravity/brain/conv-123',
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: '/Users/test/.gemini/antigravity/brain/conv-123/plan.md',
            ArtifactMetadata: {
              Summary: 'Architecture plan',
              UserFacing: true,
              RequestFeedback: true,
            },
          },
        },
      },
      { specsDir }
    );

    assert.equal(res.decision, 'allow');
    assert.ok(res.overwrite, 'Expected overwrite payload');
    assert.equal(res.overwrite.ArtifactMetadata.RequestFeedback, false);
  });

  it('@spec REQ-HOOK-402: should block writing draft_cycle_1.md before HITL-1 (approveSpec) and allow after approval', () => {
    orchestrator.initSpec({
      slug: 'hook-hitl1-test',
      title: 'Hook HITL-1 Test',
      targetFolder: '01 Negocio/03 Legal & Cumplimiento',
      subagents: ['compliance-officer'],
    });

    const draftTarget = path.join(
      tempRoot,
      '00 Inbox',
      'Specs',
      'hook-hitl1-test-work',
      'draft_cycle_1.md'
    );

    const blockedRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: draftTarget,
            CodeContent: '# Draft 1',
          },
        },
      },
      { specsDir }
    );

    assert.equal(blockedRes.decision, 'deny');
    assert.ok(blockedRes.reason?.includes('BLOQUEO HITL-1'));

    // Approve Spec (HITL-1)
    orchestrator.approveSpec('hook-hitl1-test');

    const allowedRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: draftTarget,
            CodeContent: '# Draft 1 after HITL-1',
          },
        },
      },
      { specsDir }
    );

    assert.equal(allowedRes.decision, 'allow');
  });

  it('@spec REQ-HOOK-403: should block direct write_to_file to BRIDS-Brain/01 Negocio without HITL-2 completion', () => {
    orchestrator.initSpec({
      slug: 'hook-hitl2-test',
      title: 'Hook HITL-2 Test',
      targetFolder: '01 Negocio/03 Legal & Cumplimiento',
      subagents: ['compliance-officer'],
    });
    orchestrator.approveSpec('hook-hitl2-test');

    const prodTarget = path.join(
      tempRoot,
      'BRIDS-Brain',
      '01 Negocio',
      '03 Legal & Cumplimiento',
      'hook-hitl2-test.md'
    );

    const deniedRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: prodTarget,
            CodeContent: '# Unapproved direct write',
          },
        },
      },
      { specsDir }
    );

    assert.equal(deniedRes.decision, 'deny');
    assert.ok(deniedRes.reason?.includes('BLOQUEO HITL-2'));
  });

  it('@spec REQ-HOOK-404: should enforce Serial Execution for write workers, Parallel for read gatherers, and Strategic Model Routing', () => {
    orchestrator.initSpec({
      slug: 'serial-chain-spec',
      title: 'Serial Chain Test',
      targetFolder: '01 Negocio/04 Finanzas & YC Investors',
      subagents: ['market-research-analyst', 'business-consultant', 'compliance-officer'],
    });
    orchestrator.approveSpec('serial-chain-spec');

    // 1. Parallel read gatherers are allowed in batch and routed to Model: 'flash'
    const parallelReadRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'invoke_subagent',
          args: {
            Subagents: [
              {
                TypeName: 'market-research-analyst',
                Role: 'TAM Researcher',
                Prompt: 'Gather TAM for serial-chain-spec',
                Model: 'inherit',
              },
              {
                TypeName: 'narrative-intelligence-analyst',
                Role: 'Narrative Radar',
                Prompt: 'Scan whispers for serial-chain-spec',
                Model: 'pro',
              },
            ],
          },
        },
      },
      { specsDir }
    );

    assert.equal(parallelReadRes.decision, 'allow');
    assert.ok(parallelReadRes.overwrite, 'Should rewrite Model to flash for parallel_read gatherers');
    assert.equal(parallelReadRes.overwrite.Subagents[0].Model, 'flash');
    assert.equal(parallelReadRes.overwrite.Subagents[1].Model, 'flash');

    // 2. Parallel write workers in a single batch MUST be denied
    const parallelWriteRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'invoke_subagent',
          args: {
            Subagents: [
              {
                TypeName: 'business-consultant',
                Role: 'Unit Economics',
                Prompt: 'Draft economics for serial-chain-spec',
              },
              {
                TypeName: 'compliance-officer',
                Role: 'Legal Audit',
                Prompt: 'Draft SPV section for serial-chain-spec',
              },
            ],
          },
        },
      },
      { specsDir }
    );

    assert.equal(parallelWriteRes.decision, 'deny');
    assert.ok(parallelWriteRes.reason?.includes('VIOLACIÓN DE EJECUCIÓN EN SERIE'));

    // 3. Invoking step 2 (compliance-officer) BEFORE step 1 (business-consultant) records handoff MUST be denied
    const prematureStep2Res = evaluatePreToolUse(
      {
        toolCall: {
          name: 'invoke_subagent',
          args: {
            Subagents: [
              {
                TypeName: 'compliance-officer',
                Role: 'Legal Audit',
                Prompt: 'Draft SPV section for serial-chain-spec',
              },
            ],
          },
        },
      },
      { specsDir }
    );

    assert.equal(prematureStep2Res.decision, 'deny');
    assert.ok(prematureStep2Res.reason?.includes('BLOQUEO DE HANDOFF EN SERIE'));

    // 4. Record Handoff for step 1 (business-consultant), then invoke step 2 (compliance-officer)
    orchestrator.recordWorkerHandoff('serial-chain-spec', {
      worker_id: 'business-consultant',
      completed_items: ['Unit economics table completed'],
      pending_items: [],
      decisions_made: ['Used 1.5% origination fee'],
      issues_encountered: [],
      artifact_path: '00 Inbox/Specs/serial-chain-spec-work/draft_cycle_1.md',
    });

    const validStep2Res = evaluatePreToolUse(
      {
        toolCall: {
          name: 'invoke_subagent',
          args: {
            Subagents: [
              {
                TypeName: 'compliance-officer',
                Role: 'Legal Audit',
                Prompt: 'Draft SPV section for serial-chain-spec',
                Model: 'flash',
              },
            ],
          },
        },
      },
      { specsDir }
    );

    assert.equal(validStep2Res.decision, 'allow');
    assert.ok(validStep2Res.overwrite, 'Should upgrade serial_write worker from flash to pro');
    assert.equal(validStep2Res.overwrite.Subagents[0].Model, 'pro');
  });

  it('@spec REQ-HOOK-405: should trigger Adversarial Validator on Stop hook when an unaudited draft fails ValidationContract', async () => {
    orchestrator.initSpec({
      slug: 'stop-hook-spec',
      title: 'Stop Hook Adversarial Test',
      targetFolder: '01 Negocio/03 Legal & Cumplimiento',
      subagents: ['compliance-officer'],
      acceptanceCriteria: ['Explain Delaware SPV LLC isolation'],
    });
    orchestrator.approveSpec('stop-hook-spec');

    // Write a low-quality draft_cycle_1.md without running criticism_cycle_1.json
    vault.saveDraftCycle(
      'stop-hook-spec',
      1,
      '# Draft 1\nEn el mundo actual es importante destacar un texto vacío sin anclas técnicas.'
    );

    const stopRes = await evaluateStopHook({}, { vaultRoot: tempRoot, specsDir });
    assert.equal(stopRes.decision, 'continue');
    assert.ok(stopRes.reason?.includes('VALIDADOR ADVERSARIAL'));
    assert.ok(!stopRes.reason?.includes('undefined'), 'Stop hook reason must format numeric score cleanly without undefined');

    // Infinite-loop guard: executionNum >= 3 or fullyIdle === false returns {}
    const loopGuardRes = await evaluateStopHook({ executionNum: 3 }, { vaultRoot: tempRoot, specsDir });
    assert.deepEqual(loopGuardRes, {});

    const busyGuardRes = await evaluateStopHook({ fullyIdle: false }, { vaultRoot: tempRoot, specsDir });
    assert.deepEqual(busyGuardRes, {});
  });

  it('@spec REQ-HOOK-406: should inject JIT YAML persona on invoke_subagent, enforce shallow overwrite, and block run_command shell writes to vault', () => {
    // 1. Shallow overwrite + JIT Persona Injection from BRIDS-Engine/agents/compliance-officer.yaml
    const subRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'invoke_subagent',
          args: {
            toolSummary: 'Invoke compliance officer',
            Subagents: [
              {
                TypeName: 'compliance-officer',
                Role: 'Legal Officer',
                Prompt: 'Review SPV decoupling',
                Model: 'flash',
              },
            ],
          },
        },
      },
      { specsDir }
    );

    assert.equal(subRes.decision, 'allow');
    assert.ok(subRes.overwrite);
    assert.deepEqual(Object.keys(subRes.overwrite), ['Subagents'], 'Overwrite must be shallow (only mutated top-level keys)');
    assert.equal(subRes.overwrite.Subagents[0].Model, 'pro');
    assert.ok(
      subRes.overwrite.Subagents[0].Prompt.includes('[AGENT_PERSONA: compliance-officer]'),
      'Should inject system_prompt from BRIDS-Engine/agents/compliance-officer.yaml'
    );

    // 2. Block direct shell redirection to BRIDS-Brain/01 Negocio via run_command
    const shellDeny = evaluatePreToolUse(
      {
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'echo "# Bypass" > "BRIDS-Brain/01 Negocio/03 Legal & Cumplimiento/bypass.md"',
          },
        },
      },
      { specsDir }
    );
    assert.equal(shellDeny.decision, 'deny');
    assert.ok(shellDeny.reason?.includes('BLOQUEO HITL-2'));

    // 3. Allow authorized engine script via run_command
    const shellAllow = evaluatePreToolUse(
      {
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'node BRIDS-Engine/scripts/vault/refine-note.ts inspect "BRIDS-Brain/01 Negocio/index.md"',
          },
        },
      },
      { specsDir }
    );
    assert.equal(shellAllow.decision, 'allow');
  });

  it('@spec REQ-HOOK-407: should enforce hierarchical feat/<feature> -> spec/<feature>/<slug> child branch via .git/HEAD (<0.05ms, zero subprocesses)', async () => {
    const { resolveFeatureBranch } = await import('../../scripts/sdd/sdd-orchestrator.ts');

    const fakeGitDir = path.join(tempRoot, '.git');
    fs.mkdirSync(fakeGitDir, { recursive: true });
    const headFile = path.join(fakeGitDir, 'HEAD');

    // 1. When on parent feat/yc-data-room, resolveFeatureBranch returns feat/yc-data-room
    fs.writeFileSync(headFile, 'ref: refs/heads/feat/yc-data-room\n', 'utf8');
    assert.equal(resolveFeatureBranch(undefined, tempRoot), 'feat/yc-data-room');

    // 2. When on a sibling child spec/yc-data-room/unit-economics, resolveFeatureBranch still infers parent feat/yc-data-room
    fs.writeFileSync(headFile, 'ref: refs/heads/spec/yc-data-room/unit-economics\n', 'utf8');
    assert.equal(resolveFeatureBranch(undefined, tempRoot), 'feat/yc-data-room');

    // 3. Initialize Spec with featureBranch and approve HITL-1
    orchestrator.initSpec({
      slug: 'spv-legal-memo',
      title: 'SPV Legal Memo',
      targetFolder: '01 Negocio/03 Legal & Cumplimiento',
      subagents: ['compliance-officer'],
      featureBranch: 'feat/yc-data-room',
    });
    orchestrator.approveSpec('spv-legal-memo');

    const loaded = vault.loadSpec('spv-legal-memo').data;
    assert.deepEqual(loaded.git_branch_topology, {
      feature_branch: 'feat/yc-data-room',
      spec_branch: 'spec/yc-data-room/spv-legal-memo',
      merged_at: null,
    });

    const draftTarget = path.join(
      tempRoot,
      '00 Inbox',
      'Specs',
      'spv-legal-memo-work',
      'draft_cycle_1.md'
    );

    // 4. Attempting to write draft_cycle_1.md while still on feat/yc-data-room (or wrong child branch) is DENIED
    const wrongBranchRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: draftTarget,
            CodeContent: '# Draft on wrong branch',
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(wrongBranchRes.decision, 'deny');
    assert.ok(wrongBranchRes.reason?.includes('BLOQUEO DE RAMA SDD'));

    // 5. Switching .git/HEAD to child branch spec/yc-data-room/spv-legal-memo ALLOWS writing draft_cycle_1.md
    fs.writeFileSync(headFile, 'ref: refs/heads/spec/yc-data-room/spv-legal-memo\n', 'utf8');
    const rightBranchRes = evaluatePreToolUse(
      {
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: draftTarget,
            CodeContent: '# Draft on child spec branch',
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(rightBranchRes.decision, 'allow');
  });

  it('@spec REQ-HOOK-408: should enforce main branch immutability and allow official promote main flow', async () => {
    const { resolveFeatureBranch } = await import('../../scripts/sdd/sdd-orchestrator.ts');

    const fakeGitDir = path.join(tempRoot, '.git');
    fs.mkdirSync(fakeGitDir, { recursive: true });
    const headFile = path.join(fakeGitDir, 'HEAD');

    // 1. On develop, resolveFeatureBranch with fallbackSlug infers feat/<slug>
    fs.writeFileSync(headFile, 'ref: refs/heads/develop\n', 'utf8');
    assert.equal(resolveFeatureBranch(undefined, tempRoot, 'spv-compliance'), 'feat/spv-compliance');

    // 2. On main, any file edit in the workspace is DENIED
    fs.writeFileSync(headFile, 'ref: refs/heads/main\n', 'utf8');
    const editOnMain = evaluatePreToolUse(
      {
        toolCall: {
          name: 'replace_file_content',
          args: {
            TargetFile: path.join(tempRoot, 'BRIDS-Engine', 'bin', 'engine.ts'),
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(editOnMain.decision, 'deny');
    assert.ok(editOnMain.reason?.includes('BLOQUEO DE RAMA MAIN'));

    // 3. On main, direct git commit or git merge is DENIED
    const commitOnMain = evaluatePreToolUse(
      {
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'git commit -m "direct commit on main"',
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(commitOnMain.decision, 'deny');
    assert.ok(commitOnMain.reason?.includes('BLOQUEO DE RAMA MAIN'));

    // 4. Even from develop, direct git push origin main is DENIED unless via promote main
    fs.writeFileSync(headFile, 'ref: refs/heads/develop\n', 'utf8');
    const directPushMain = evaluatePreToolUse(
      {
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'git push origin main',
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(directPushMain.decision, 'deny');
    assert.ok(directPushMain.reason?.includes('BLOQUEO DE RAMA MAIN'));

    // 5. Official promotion command is ALLOWED
    const officialPromote = evaluatePreToolUse(
      {
        toolCall: {
          name: 'run_command',
          args: {
            CommandLine: 'node BRIDS-Engine/bin/engine.ts promote main --push',
          },
        },
      },
      { specsDir, gitRoot: tempRoot }
    );
    assert.equal(officialPromote.decision, 'allow');
  });
});


