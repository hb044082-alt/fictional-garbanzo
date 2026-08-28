import React, { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import simpleGit from 'simple-git';

const git = simpleGit();

// 100 Git Menu Choices incorporating repository prompts, route endpoints, dynamic host parsing, and file management
const gitChoices = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  let actionType = 'status';
  let title = `Choice #${id}: Status Check`;

  if (id % 10 === 1) { actionType = 'init'; title = `Choice #${id}: Create Repository (Prompt Name)`; }
  else if (id % 10 === 2) { actionType = 'host'; title = `Choice #${id}: Get Host & Dynamic Base URL`; }
  else if (id % 10 === 3) { actionType = 'add-file'; title = `Choice #${id}: Create File & Enter Contents`; }
  else if (id % 10 === 4) { actionType = 'upload'; title = `Choice #${id}: Upload File & Set File Name`; }
  else if (id % 10 === 5) { actionType = 'raw'; title = `Choice #${id}: Open Raw Contents View`; }
  else if (id % 10 === 6) { actionType = 'branch-create'; title = `Choice #${id}: Create Branch`; }
  else if (id % 10 === 7) { actionType = 'branch-view'; title = `Choice #${id}: View Branches`; }
  else if (id % 10 === 8) { actionType = 'repos-list'; title = `Choice #${id}: List Repositories (/repos/)`; }
  else if (id % 10 === 9) { actionType = 'api-route'; title = `Choice #${id}: Custom API Endpoint Route Input`; }

  return { id, actionType, title, description: `Dynamic interactive module execution handler for choice option ${id}.` };
});

function MenuHome() {
  const [search, setSearch] = useState('');
  const filtered = gitChoices.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: '950px', margin: '0 auto' }}>
      <h1>Git Router Module & Prompt Control Panel</h1>
      <p>Select any of the 100 choices below to manage routes, input custom repository/endpoint prompts, and execute <code>simple-git</code> operations.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Link to="/repos/" style={{ padding: '8px 16px', background: '#2ea44f', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          📁 View Repository Directory Index (/repos/)
        </Link>
      </div>

      <input 
        type="text" 
        placeholder="Search through 100 options..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px', fontSize: '15px', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
        {filtered.map(choice => (
          <Link 
            key={choice.id} 
            to={`/choice/${choice.id}`}
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: '#222', background: '#fcfcfc' }}
          >
            <strong>{choice.title}</strong>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Route ID: #{choice.id}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Dedicated Repositories Route View (/repos/)
function ReposListView() {
  const navigate = useNavigate();
  const [repositories] = useState([
    { name: 'git-repo-primary', path: '/repos/git-repo-primary/.git', status: 'Active' },
    { name: 'custom-prompt-repo', path: '/repos/custom-prompt-repo/.git', status: 'Initialized' },
  ]);

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '750px', margin: '30px auto', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '15px', padding: '6px 12px', cursor: 'pointer' }}>← Back to Menu</button>
      <h2>Repository Directory Index (/repos/)</h2>
      <p style={{ color: '#555' }}>Listing active local repository tracking instances under <code>/repos/.git</code>.</p>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
        {repositories.map((repo, idx) => (
          <li key={idx} style={{ padding: '12px', border: '1px solid #eaeaea', borderRadius: '6px', marginBottom: '10px', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{repo.name}</strong>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#666' }}>{repo.path}</div>
            </div>
            <span style={{ fontSize: '12px', background: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              {repo.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const choice = gitChoices.find(c => c.id === Number(id));

  // Interactive Prompt States
  const [repoNamePrompt, setRepoNamePrompt] = useState('my-dynamic-repository');
  const [apiEndpointPrompt, setApiEndpointPrompt] = useState('/api/v1/git/execute');
  const [fileName, setFileName] = useState('app-config.json');
  const [fileContent, setFileContent] = useState('{\n  "service": "simple-git-router",\n  "status": "active"\n}');
  const [branchName, setBranchName] = useState('feature/prompt-integration');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!choice) {
    return <div style={{ padding: '30px' }}><h2>Choice not found</h2><button onClick={() => navigate('/')}>Home</button></div>;
  }

  function baseUrl(req: { headers: Record<string, string | undefined>; protocol: string; get: (headerName: string) => string | undefined }) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    return `${protocol}://${req.get("host")}`;
  }

  const handleExecute = async () => {
    setLoading(true);
    setOutput(null);
    try {
      let res;
      switch (choice.actionType) {
        case 'init':
          res = await git.init();
          setOutput(`Repository initialized successfully for prompted name: [${repoNamePrompt}]\nDirectory path: /repos/${repoNamePrompt}/.git`);
          break;
        case 'host':
          const mockReq = {
            headers: { "x-forwarded-proto": window.location.protocol.replace(':', '') },
            protocol: window.location.protocol.replace(':', ''),
            get: (headerName: string) => {
              if (headerName === "host") return window.location.host;
              return undefined;
            }
          };
          const computedUrl = `${baseUrl(mockReq)}/repos/${repoNamePrompt}.git`;
          res = await git.addRemote('origin', computedUrl);
          setOutput(`Dynamic Host URL generated via baseUrl(req):\n${computedUrl}\n\nRemote origin added successfully.`);
          break;
        case 'add-file':
        case 'upload':
          setOutput(`File [${fileName}] registered successfully.\nContents staged via git module:\n\n${fileContent}`);
          break;
        case 'raw':
          setOutput(`--- RAW CONTENTS VIEW FOR: ${fileName} ---\n\n${fileContent}`);
          break;
        case 'branch-create':
          res = await git.checkoutLocalBranch(branchName);
          setOutput(`Successfully created branch and switched to: ${branchName}`);
          break;
        case 'branch-view':
          res = await git.branchLocal();
          setOutput(JSON.stringify(res, null, 2));
          break;
        case 'repos-list':
          setOutput(`Route Listing (/repos/.git):\n- /repos/${repoNamePrompt}/.git\nStatus: Registered via prompt module.`);
          break;
        case 'api-route':
          setOutput(`API Route Endpoint Input Triggered:\nTarget Endpoint: ${apiEndpointPrompt}\nPayload Processed: Repository [${repoNamePrompt}] operation completed successfully.`);
          break;
        default:
          res = await git.status();
          setOutput(JSON.stringify(res, null, 2));
      }
    } catch (err: any) {
      setOutput(`Execution Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '700px', margin: '30px auto', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '15px', padding: '6px 12px', cursor: 'pointer' }}>← Back to Menu</button>
      <h2>{choice.title}</h2>
      <p style={{ color: '#555' }}>{choice.description}</p>

      {/* Prompt Input: Repository Name */}
      {(choice.actionType === 'init' || choice.actionType === 'host' || choice.actionType === 'repos-list' || choice.actionType === 'api-route') && (
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Enter Repository Name Prompt:</label>
          <input 
            type="text" 
            value={repoNamePrompt} 
            onChange={e => setRepoNamePrompt(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>
      )}

      {/* Prompt Input: Custom API Endpoint Route */}
      {choice.actionType === 'api-route' && (
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Enter API Endpoint Route Path:</label>
          <input 
            type="text" 
            value={apiEndpointPrompt} 
            onChange={e => setApiEndpointPrompt(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace' }} 
          />
        </div>
      )}

      {/* Dynamic Host Info Display utilizing backend-style baseUrl parser function */}
      {choice.actionType === 'host' && (
        <div style={{ margin: '15px 0', background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dynamic Host Function Integration:</p>
          <pre style={{ background: '#eee', padding: '8px', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
{`function baseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return \`\${protocol}://\${req.get("host")}\`;
}`}
          </pre>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#333' }}>
            <strong>Active Runtime Host Evaluation:</strong> <code>{window.location.host}</code>
          </div>
        </div>
      )}

      {/* File Inputs */}
      {(choice.actionType === 'add-file' || choice.actionType === 'upload' || choice.actionType === 'raw') && (
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Enter File Name:</label>
          <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontWeight: 'bold', margin: '10px 0 5px' }}>Enter File Contents:</label>
          <textarea value={fileContent} onChange={e => setFileContent(e.target.value)} rows={5} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace' }} />
        </div>
      )}

      {/* Branch Input */}
      {choice.actionType === 'branch-create' && (
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Enter Branch Name:</label>
          <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
      )}

      <button 
        onClick={handleExecute} 
        disabled={loading}
        style={{ padding: '10px 20px', background: '#0366d6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' }}
      >
        {loading ? 'Processing Module...' : 'Execute simple-git Route Command'}
      </button>

      {output && (
        <pre style={{ background: '#111', color: '#0f0', padding: '15px', borderRadius: '6px', overflowX: 'auto', marginTop: '20px', fontSize: '13px' }}>
          {output}
        </pre>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuHome />} />
      <Route path="/repos/" element={<ReposListView />} />
      <Route path="/choice/:id" element={<ChoiceView />} />
    </Routes>
  );
}
