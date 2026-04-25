/*
 * components/GraphSettingsPanel.tsx
 *
 * A React component that allows users to configure visualization settings
 * for the code dependency graph, such as layout algorithms, filtering options,
 * and styling preferences.
 */

import React, { useState } from 'react';

// Mock types for graph configuration
interface GraphSettings {
    layoutAlgorithm: 'force' | 'tree' | 'circle';
    showDependencies: boolean;
    highlightSecurity: boolean;
    maxNodeSize: number;
}

interface GraphSettingsPanelProps {
    initialSettings: GraphSettings;
    onSettingsChange: (settings: GraphSettings) => void;
}

const GraphSettingsPanel: React.FC<GraphSettingsPanelProps> = ({ initialSettings, onSettingsChange }) => {
    const [settings, setSettings] = useState<GraphSettings>(initialSettings);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = event.target;
        let newValue: string | number | boolean;

        if (type === 'checkbox') {
            newValue = (event.target as HTMLInputElement).checked;
        } else {
            newValue = value;
        }

        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: newValue,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSettingsChange(settings);
        console.log('Settings updated:', settings);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Graph Visualization Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {/* Layout Algorithm */}
                <div>
                    <label htmlFor="layoutAlgorithm" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Layout Algorithm:</label>
                    <select
                        id="layoutAlgorithm"
                        name="layoutAlgorithm"
                        value={settings.layoutAlgorithm}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="force">Force Directed</option>
                        <option value="tree">Tree</option>
                        <option value="circle">Circle</option>
                    </select>
                </div>

                {/* Show Dependencies Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="checkbox"
                        id="showDependencies"
                        name="showDependencies"
                        checked={settings.showDependencies}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="showDependencies" style={{ fontWeight: 'bold' }}>Show Dependencies</label>
                </div>

                {/* Highlight Security Issues Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="checkbox"
                        id="highlightSecurity"
                        name="highlightSecurity"
                        checked={settings.highlightSecurity}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="highlightSecurity" style={{ fontWeight: 'bold' }}>Highlight Security Issues</label>
                </div>

                {/* Max Node Size Slider */}
                <div>
                    <label htmlFor="maxNodeSize" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Node Size:</label>
                    <input
                        type="range"
                        id="maxNodeSize"
                        name="maxNodeSize"
                        min="10"
                        max="50"
                        value={settings.maxNodeSize}
                        onChange={handleInputChange}
                        style={{ width: 'calc(100% - 20px)', verticalAlign: 'middle' }}
                    />
                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{settings.maxNodeSize}</span>
                </div>
            </div>

            <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Apply Settings
            </button>
        </form>
    );
};

export default GraphSettingsPanel;

// --- Example Usage (for testing outside a React environment) ---
async function demonstrateGraphSettingsPanel() {
    console.log('--- Demonstrating Graph Settings Panel ---');

    const initialSettings: GraphSettings = {
        layoutAlgorithm: 'force',
        showDependencies: true,
        highlightSecurity: false,
        maxNodeSize: 30,
    };

    const handleSettingsUpdate = (settings: GraphSettings) => {
        console.log('Parent received updated settings:', settings);
    };

    console.log('Simulating GraphSettingsPanel component rendering with initial settings:', initialSettings);
    // In a real React app, this component would be rendered with props.
    // We'll simulate the interaction by logging the callback output.
    // Example of how parent might receive updated settings:
    // handleSettingsUpdate(initialSettings); // Simulate initial render
    // Simulate user changing settings and submitting
    const updatedSettings: GraphSettings = {
        layoutAlgorithm: 'circle',
        showDependencies: false,
        highlightSecurity: true,
        maxNodeSize: 45,
    };
    // handleSettingsUpdate(updatedSettings); // Simulate submission
    console.log('Simulated form submission with updated settings:', updatedSettings);
}

// demonstrateGraphSettingsPanel(); // Uncomment to run example in a suitable environment
