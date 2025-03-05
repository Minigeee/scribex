import { Edge, Node } from '@xyflow/react';

// Custom skill tree layout algorithm with vertical branching structure
export const getLayoutedElements = (nodes: Node[], edges: Edge[], nodeHeight: number = 100) => {
  if (!nodes.length) return { nodes, edges };

  // Find the root node (node with no incoming edges)
  const hasIncomingEdge = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(node => !hasIncomingEdge.has(node.id));
  
  if (!rootNodes.length) {
    // If no root node found, use the first node as root
    rootNodes.push(nodes[0]);
  }

  // Create an adjacency list for faster traversal
  const adjacencyList: Record<string, string[]> = {};
  const reverseAdjacencyList: Record<string, string[]> = {};
  
  // Initialize adjacency lists
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
    reverseAdjacencyList[node.id] = [];
  });
  
  // Fill adjacency lists
  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    reverseAdjacencyList[edge.target].push(edge.source);
  });

  // Calculate node levels (distance from root)
  const nodeLevels: Record<string, number> = {};
  const nodeVisited: Record<string, boolean> = {};
  
  // Initialize with root nodes
  rootNodes.forEach(root => {
    nodeLevels[root.id] = 0;
    nodeVisited[root.id] = true;
  });
  
  // BFS to calculate initial levels
  const queue = [...rootNodes.map(node => node.id)];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const neighbors = adjacencyList[currentId] || [];
    
    for (const neighbor of neighbors) {
      // Update level if not set or if new path is shorter
      if (!nodeVisited[neighbor] || nodeLevels[neighbor] > nodeLevels[currentId] + 1) {
        nodeLevels[neighbor] = nodeLevels[currentId] + 1;
        nodeVisited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }

  // Resolve level conflicts - if a node has a prerequisite on the same level, push it down
  let hasChanges = true;
  while (hasChanges) {
    hasChanges = false;

    nodes.forEach(node => {
      const prerequisites = reverseAdjacencyList[node.id] || [];
      
      // Check for prerequisites on the same level
      for (const prereqId of prerequisites) {
        if (nodeLevels[prereqId] >= nodeLevels[node.id]) {
          // Push this node down one level
          nodeLevels[node.id] = nodeLevels[prereqId] + 1;
          hasChanges = true;
          
          // Since we pushed this node down, we need to update its descendants
          const descendantsQueue = [...adjacencyList[node.id]];
          const visited = new Set<string>();
          visited.add(node.id);
          
          while (descendantsQueue.length > 0) {
            const descendantId = descendantsQueue.shift()!;
            if (visited.has(descendantId)) continue;
            visited.add(descendantId);
            
            // Update level if needed
            if (nodeLevels[descendantId] <= nodeLevels[node.id]) {
              nodeLevels[descendantId] = nodeLevels[node.id] + 1;
              
              // Add its descendants to the queue
              adjacencyList[descendantId].forEach(id => {
                if (!visited.has(id)) {
                  descendantsQueue.push(id);
                }
              });
            }
          }
          
          break; // Once pushed down, no need to check other prerequisites
        }
      }
    });
  }

  // Find the node with maximum distance from root (furthest leaf)
  let maxDistance = 0;
  let furthestNodeId = rootNodes[0].id;
  
  Object.entries(nodeLevels).forEach(([nodeId, level]) => {
    if (level > maxDistance) {
      maxDistance = level;
      furthestNodeId = nodeId;
    }
  });

  // Calculate shortest path from furthest node back to root
  const mainBranchNodes = new Set<string>();
  let currentNode = furthestNodeId;
  mainBranchNodes.add(currentNode);
  
  while (reverseAdjacencyList[currentNode] && reverseAdjacencyList[currentNode].length > 0) {
    // Find prerequisite with minimum level (shortest path back to root)
    const prerequisites = reverseAdjacencyList[currentNode];
    let minLevel = Number.MAX_SAFE_INTEGER;
    let nextNode = prerequisites[0];
    
    for (const prereqId of prerequisites) {
      if (nodeLevels[prereqId] < minLevel) {
        minLevel = nodeLevels[prereqId];
        nextNode = prereqId;
      }
    }
    
    currentNode = nextNode;
    mainBranchNodes.add(currentNode);
  }
  
  // Identify branches starting from main branch
  const branches: string[][] = [];
  const nodeInBranch: Record<string, number> = {};
  
  // Main branch is branch 0
  branches.push(Array.from(mainBranchNodes));
  mainBranchNodes.forEach(nodeId => {
    nodeInBranch[nodeId] = 0;
  });
  
  // Find leaf nodes
  const isLeafNode = (nodeId: string): boolean => 
    !adjacencyList[nodeId] || adjacencyList[nodeId].length === 0;
  
  // Find branch points (nodes with multiple outgoing edges)
  const isBranchPoint = (nodeId: string): boolean => 
    adjacencyList[nodeId] && adjacencyList[nodeId].length > 1;
  
  // Find merge points (nodes with multiple incoming edges)
  const isMergePoint = (nodeId: string): boolean => 
    reverseAdjacencyList[nodeId] && reverseAdjacencyList[nodeId].length > 1;

  // Identify all non-main branch nodes using BFS
  const identifyBranches = () => {
    // Start with all branch points on the main branch
    const branchPoints = Array.from(mainBranchNodes).filter(nodeId => isBranchPoint(nodeId));
    
    // Process branch points
    branchPoints.forEach(branchPoint => {
      const neighbors = adjacencyList[branchPoint];
      
      neighbors.forEach(neighborId => {
        // Skip if already in main branch
        if (mainBranchNodes.has(neighborId)) return;
        
        // Create a new branch for this neighbor
        const newBranchId = branches.length;
        const newBranch: string[] = [neighborId];
        nodeInBranch[neighborId] = newBranchId;
        
        // Trace this branch
        const queue = [neighborId];
        const visited = new Set<string>([neighborId]);
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const nextNodes = adjacencyList[currentId] || [];
          
          for (const nextId of nextNodes) {
            // If already visited or in main branch, skip
            if (visited.has(nextId) || mainBranchNodes.has(nextId)) continue;
            
            visited.add(nextId);
            newBranch.push(nextId);
            nodeInBranch[nextId] = newBranchId;
            
            // If this is a branch point but not a merge point, we need to decide
            if (isBranchPoint(nextId) && !isMergePoint(nextId)) {
              // Process this branch point immediately
              const subNeighbors = adjacencyList[nextId];
              
              subNeighbors.forEach(subId => {
                if (!visited.has(subId) && !mainBranchNodes.has(subId)) {
                  queue.push(subId);
                }
              });
            }
            // If this is a merge point, don't follow its children
            else if (!isMergePoint(nextId)) {
              queue.push(nextId);
            }
          }
        }
        
        branches.push(newBranch);
      });
    });
  };
  
  // Identify all branches
  identifyBranches();

  // Make sure all nodes are assigned to a branch
  nodes.forEach(node => {
    if (nodeInBranch[node.id] === undefined) {
      // Find shortest path to main branch
      const visited = new Set<string>();
      const queue: [string, number][] = [[node.id, -1]]; // [nodeId, parentBranch]
      
      while (queue.length > 0) {
        const [currentId, parentBranch] = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        // If we know which branch this node belongs to
        if (nodeInBranch[currentId] !== undefined) {
          let currentBranch = nodeInBranch[currentId];
          
          // Backtrack and assign all nodes in path to this branch
          for (const visitedId of Array.from(visited)) {
            if (nodeInBranch[visitedId] === undefined) {
              nodeInBranch[visitedId] = currentBranch;
              branches[currentBranch].push(visitedId);
            }
          }
          
          break;
        }
        
        // Check prerequisites
        for (const prereqId of reverseAdjacencyList[currentId] || []) {
          if (!visited.has(prereqId)) {
            queue.push([prereqId, parentBranch]);
          }
        }
        
        // Check descendants
        for (const childId of adjacencyList[currentId] || []) {
          if (!visited.has(childId)) {
            queue.push([childId, parentBranch]);
          }
        }
      }
      
      // If still not assigned, put in branch 0 (main branch)
      if (nodeInBranch[node.id] === undefined) {
        nodeInBranch[node.id] = 0;
        branches[0].push(node.id);
      }
    }
  });

  // Calculate x-position for each branch
  const HORIZONTAL_SPACING = 300; // Space between branches
  const branchPositions: Record<number, number> = {};
  
  // Calculate total width
  const branchCount = branches.length;
  const totalWidth = (branchCount - 1) * HORIZONTAL_SPACING;
  
  // Position branches horizontally - main branch in center, others spread out
  branchPositions[0] = 0; // Main branch at center
  
  // Position other branches
  let leftBranchIndex = 1;
  let rightBranchIndex = 1;
  
  for (let i = 1; i < branchCount; i++) {
    if (i % 2 === 1) {
      // Position on the right
      branchPositions[i] = rightBranchIndex * HORIZONTAL_SPACING;
      rightBranchIndex++;
    } else {
      // Position on the left
      branchPositions[i] = -leftBranchIndex * HORIZONTAL_SPACING;
      leftBranchIndex++;
    }
  }

  // Calculate final node positions
  const VERTICAL_SPACING = nodeHeight + 100; // Space between levels
  const positionedNodes = nodes.map(node => {
    const level = nodeLevels[node.id] || 0;
    const branchIndex = nodeInBranch[node.id] || 0;
    
    return {
      ...node,
      position: {
        x: branchPositions[branchIndex],
        y: level * VERTICAL_SPACING
      }
    };
  });

  // For merge points, adjust position to be centered between incoming branches
  nodes.forEach(node => {
    if (isMergePoint(node.id)) {
      const parentIds = reverseAdjacencyList[node.id];
      let sumX = 0;
      
      // Sum up all parent x positions
      parentIds.forEach(parentId => {
        const parentNode = positionedNodes.find(n => n.id === parentId);
        if (parentNode) {
          sumX += parentNode.position.x;
        }
      });
      
      // Average x position of parents
      const avgX = sumX / parentIds.length;
      
      // Find this node in positionedNodes and update x position
      const nodeToUpdate = positionedNodes.find(n => n.id === node.id);
      if (nodeToUpdate) {
        nodeToUpdate.position.x = avgX;
      }
    }
  });

  // Create nice curved edges
  const positionedEdges = edges.map(edge => {
    // Check if this is a "branch" edge (nodes in different branches)
    const sourceNodeBranchIndex = nodeInBranch[edge.source];
    const targetNodeBranchIndex = nodeInBranch[edge.target];
    
    const isCrossBranchEdge = sourceNodeBranchIndex !== targetNodeBranchIndex;
    const isMainBranchEdge = sourceNodeBranchIndex === 0 || targetNodeBranchIndex === 0;
    
    return {
      ...edge,
      type: 'smoothstep', // Use smooth step edges for nice visualization
      animated: true,
      style: {
        stroke: isMainBranchEdge ? '#444' : (isCrossBranchEdge ? '#666' : '#888'),
        strokeWidth: isMainBranchEdge ? 2.5 : (isCrossBranchEdge ? 1.5 : 2),
        opacity: isMainBranchEdge ? 0.9 : 0.8,
      },
    };
  });

  return { nodes: positionedNodes, edges: positionedEdges };
};
