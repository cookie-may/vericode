/*
 * lib/core/engine/ScannerEngine.ts
 *
 * The main orchestrator for the code scanning process. It coordinates
 * different analyzers and reporters to process a project's files.\n*/

import { CodeAnalyzer, AnalysisResult } from '../../analysis/CodeAnalyzer';
import { DependencyAnalyzer } from '../../analysis/DependencyCalculator';
import { ReportGenerator } from '../../reporting/ReportGenerator';
// Importing specific formatters for potential direct use or clearer dependency
import { JsonReportFormatter } from '../../reporting/JsonReporter';
import { HtmlReportFormatter } from '../../reporting/HtmlReporter';
import { CodeGraphRenderer } from '../../visualization/CodeGraphRenderer';
import { GraphLayoutEngine } from '../../visualization/GraphLayoutEngine';
import { GraphNodeFactory } from '../../visualization/GraphNode';
import { NodeStyleManager } from '../../visualization/NodeStyleManager';

export class ScannerEngine {
    private codeAnalyzer: CodeAnalyzer;
    private dependencyAnalyzer: DependencyAnalyzer;
    private graphRenderer: CodeGraphRenderer;
    private layoutEngine: GraphLayoutEngine;
    private nodeFactory: GraphNodeFactory;
    private nodeStyleManager: NodeStyleManager;
    private jsonReporter: ReportGenerator;
    private htmlReporter: ReportGenerator;

    constructor() {
        // Initialize all components. In a real app, dependency injection would manage this.
        this.codeAnalyzer = new CodeAnalyzer();
        this.dependencyAnalyzer = new DependencyAnalyzer();
        this.graphRenderer = new CodeGraphRenderer();
        this.layoutEngine = new GraphLayoutEngine();
        this.nodeFactory = new GraphNodeFactory();
        this.nodeStyleManager = new NodeStyleManager();

        // Initialize reporters with their formatters
        this.jsonReporter = new ReportGenerator(new JsonReportFormatter());
        this.htmlReporter = new ReportGenerator(new HtmlReportFormatter());

        console.log('[ScannerEngine] Initialized.');
    }

    /**
     * Scans a list of files, performs analysis, and generates reports.
     * @param filePaths An array of file paths to scan.
     * @returns A promise resolving to an object containing generated reports and graph data.
     */
    async scanProject(filePaths: string[]): Promise<{ jsonReport: string; htmlReport: string; graphData: any }> {
        console.log(`[ScannerEngine] Starting scan for ${filePaths.length} files.`);

        // 1. Perform code analysis
        const analysisResults = await this.codeAnalyzer.analyzeProject(filePaths);
        console.log(`[ScannerEngine] Analysis completed for ${analysisResults.length} files.`);

        // 2. Build dependency graph data
        // For graph building, we need to simulate the structure expected by DependencyAnalyzer
        // and then format it for the renderer.
        const projectGraphData = this.dependencyAnalyzer.buildDependencyGraph(filePaths);
        const graphNodes: GraphNode[] = [];
        const graphLinks: any[] = []; // Using any for simplicity, define Link type later

        // Populate nodes and links for the graph renderer
        const nodesMap = new Map<string, GraphNode>(); // Use map to avoid duplicate nodes

        analysisResults.forEach(result => {
            // Ensure current file is a node
            if (!nodesMap.has(result.filePath)) {
                const node = this.nodeFactory.createNode(result.filePath, result.filePath.split('/').pop() || result.filePath);
                graphNodes.push(node);
                nodesMap.set(result.filePath, node);
            }
            // Add nodes for dependencies and create links
            result.dependencies.forEach(depPath => {
                if (!nodesMap.has(depPath)) {
                    const depNode = this.nodeFactory.createNode(depPath, depPath.split('/').pop() || depPath);
                    graphNodes.push(depNode);
                    nodesMap.set(depPath, depNode);
                }
                graphLinks.push({ source: result.filePath, target: depPath, type: 'import' });
            });
        });
        // Add nodes/links from projectGraphData if it contains more info (e.g., indirect dependencies)
        // For simplicity, analysisResults already contain direct dependencies.

        // 3. Prepare graph layout
        this.layoutEngine.setData(graphNodes, graphLinks);
        const graphLayout = await this.layoutEngine.calculateForceDirectedLayout();
        console.log(`[ScannerEngine] Graph layout calculated with ${graphLayout.nodes.length} nodes.`);

        // 4. Generate reports
        const jsonReport = this.jsonReporter.generateReport('Project Scan Report (JSON)', analysisResults);
        const htmlReport = this.htmlReporter.generateReport('Project Scan Report (HTML)', analysisResults);

        console.log('[ScannerEngine] Scan process completed. Reports generated.');  

        // Return reports and graph data
        return { jsonReport, htmlReport, graphData: graphLayout };
    }
}

// --- Example Usage ---
async function demonstrateScannerEngine() {
    console.log('--- Demonstrating Scanner Engine ---');
    const engine = new ScannerEngine();

    const filesToScan = [
        'src/main.ts',
        'src/utils.ts',
        'src/components/Button.ts',
        'lib/core/index.ts',
        'lib/analysis/CodeAnalyzer.ts',
        'lib/analysis/DependencyCalculator.ts',
        'lib/visualization/GraphNode.ts',
        'lib/visualization/CodeGraphRenderer.ts',
    ];

    const scanResults = await engine.scanProject(filesToScan);

    console.log('\n--- Scanner Engine Scan Complete ---');
    console.log('JSON Report Snippet:\n', scanResults.jsonReport.substring(0, 400) + '
...');\nconsole.log('
HTML Report Snippet:
', scanResults.htmlReport.substring(0, 500) + '
...');\nconsole.log('
Graph Layout Data (first node):', scanResults.graphData.nodes.length > 0 ? scanResults.graphData.nodes[0] : 'No nodes');\n}

demonstrateScannerEngine();
