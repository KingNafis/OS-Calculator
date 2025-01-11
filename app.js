// Event listener for algorithm selection
document.getElementById('algorithm').addEventListener('change', function() {
    let algorithm = this.value;
    console.log("Algorithm selected:", algorithm); // Debugging

    // Handling display for Round Robin algorithm
    if (algorithm === 'RR') {
        document.getElementById('quantum-container').style.display = 'block';
        document.getElementById('priorities-container').style.display = 'none';
    }
    // Handling display for Priority-based algorithms
    else if (algorithm === 'PriorityNonPreemptive' || algorithm === 'PriorityPreemptive') {
        document.getElementById('priorities-container').style.display = 'block';
        document.getElementById('quantum-container').style.display = 'none';
    }
    // Hide both containers for other algorithms
    else {
        document.getElementById('quantum-container').style.display = 'none';
        document.getElementById('priorities-container').style.display = 'none';
    }
});

// Event listener for the solve button
document.getElementById('solve').addEventListener('click', function() {
    let algorithm = document.getElementById('algorithm').value;
    let arrivalTimes = document.getElementById('arrival').value.split(',').map(Number);
    let burstTimes = document.getElementById('burst').value.split(',').map(Number);
    let priorities = document.getElementById('priorities').value.split(',').map(Number);
    let quantum = parseInt(document.getElementById('quantum').value); // For Round Robin

    console.log("Arrival Times:", arrivalTimes); // Debugging
    console.log("Burst Times:", burstTimes); // Debugging

    let result = '';
    if (arrivalTimes.length !== burstTimes.length) {
        result = 'Error: Arrival and Burst times must have the same number of values.';
        document.getElementById('output').textContent = result;
        return;
    }

    // Handle the selected algorithm
    if (algorithm === 'FCFS') {
        result = calculateFCFS(arrivalTimes, burstTimes);
    } else if (algorithm === 'RR') {
        result = calculateRR(arrivalTimes, burstTimes, quantum);
    } else if (algorithm === 'SJFNonPreemptive') {
        result = calculateSJFNonPreemptive(arrivalTimes, burstTimes);
    } else if (algorithm === 'SJFPreemptive') {
        result = calculateSJFPreemptive(arrivalTimes, burstTimes);
    } else if (algorithm === 'PriorityNonPreemptive') {
        if (priorities.length !== arrivalTimes.length) {
            result = 'Error: Arrival times and Priority values must have the same number of values.';
            document.getElementById('output').textContent = result;
            return;
        }
        result = calculatePriorityNonPreemptive(arrivalTimes, burstTimes, priorities);
    } else if (algorithm === 'PriorityPreemptive') {
        if (priorities.length !== arrivalTimes.length) {
            result = 'Error: Arrival times and Priority values must have the same number of values.';
            document.getElementById('output').textContent = result;
            return;
        }
        result = calculatePriorityPreemptive(arrivalTimes, burstTimes, priorities);
    } else {
        result = 'Algorithm not yet implemented';
    }

    document.getElementById('output').textContent = result;
});


// FCFS Algorithm Calculation
function calculateFCFS(arrivalTimes, burstTimes) {
    let n = arrivalTimes.length;
    let waitingTime = new Array(n);
    let turnaroundTime = new Array(n);
    let completionTime = new Array(n);
    let currentTime = 0;
    let ganttChart = '';

    for (let i = 0; i < n; i++) {
        if (currentTime < arrivalTimes[i]) {
            currentTime = arrivalTimes[i];
        }
        ganttChart += `| P${i + 1} `;
        waitingTime[i] = currentTime - arrivalTimes[i];
        currentTime += burstTimes[i];
        completionTime[i] = currentTime;
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }
    ganttChart += '|';

    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}

//SJF Non-Premtive
function calculateSJFNonPreemptive(arrivalTimes, burstTimes) {
    let n = arrivalTimes.length;
    let waitingTime = new Array(n);
    let turnaroundTime = new Array(n);
    let completionTime = new Array(n);
    let currentTime = 0;
    let ganttChart = '';

    let processes = Array.from({ length: n }, (_, i) => ({
        id: i,
        arrivalTime: arrivalTimes[i],
        burstTime: burstTimes[i]
    }));

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (processes.length > 0) {
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length > 0) {
            let shortestJob = availableProcesses.reduce((prev, curr) => (prev.burstTime < curr.burstTime ? prev : curr));
            processes = processes.filter(p => p.id !== shortestJob.id);
            ganttChart += `| P${shortestJob.id + 1} `;
            currentTime += shortestJob.burstTime;
            completionTime[shortestJob.id] = currentTime;
            waitingTime[shortestJob.id] = currentTime - shortestJob.arrivalTime - shortestJob.burstTime;
        } else {
            currentTime++;
        }
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }

    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}

// Preemptive SJF Algorithm Calculation
function calculateSJFPreemptive(arrivalTimes, burstTimes) {
    let n = arrivalTimes.length;
    let remainingBurstTimes = burstTimes.slice(); // Copy of burst times to track remaining burst times
    let waitingTime = new Array(n).fill(0);
    let turnaroundTime = new Array(n).fill(0);
    let completionTime = new Array(n).fill(0);
    let currentTime = 0;
    let ganttChart = '';
    let processes = Array.from({ length: n }, (_, i) => ({
        id: i,
        arrivalTime: arrivalTimes[i],
        burstTime: burstTimes[i]
    }));

    let completed = 0;
    let prevProcess = -1;

    // Main loop for Preemptive SJF
    while (completed < n) {
        // Get all processes that have arrived by currentTime
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && remainingBurstTimes[p.id] > 0);
        
        // If there are available processes, pick the one with the shortest remaining burst time
        if (availableProcesses.length > 0) {
            let shortestJob = availableProcesses.reduce((prev, curr) => 
                remainingBurstTimes[prev.id] < remainingBurstTimes[curr.id] ? prev : curr);

            if (prevProcess !== shortestJob.id) {
                ganttChart += `| P${shortestJob.id + 1} `;
                prevProcess = shortestJob.id;
            }

            // Execute the process for 1 unit of time
            remainingBurstTimes[shortestJob.id]--;
            currentTime++;

            // If the process has finished, calculate its completion, waiting, and turnaround times
            if (remainingBurstTimes[shortestJob.id] === 0) {
                completed++;
                completionTime[shortestJob.id] = currentTime;
                waitingTime[shortestJob.id] = completionTime[shortestJob.id] - arrivalTimes[shortestJob.id] - burstTimes[shortestJob.id];
            }
        } else {
            // If no process is available, increment the current time
            currentTime++;
        }
    }

    // Calculate turnaround times
    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }

    // Calculate average waiting time and turnaround time
    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    // Prepare the final result
    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}

//Round Robin
function calculateRR(arrivalTimes, burstTimes, quantum) {
    let n = arrivalTimes.length;
    let remainingBurstTimes = [...burstTimes];
    let waitingTime = new Array(n).fill(0);
    let turnaroundTime = new Array(n).fill(0);
    let completionTime = new Array(n).fill(0);
    let currentTime = 0;
    let ganttChart = '';
    let queue = [];

    while (queue.length > 0 || remainingBurstTimes.some(burstTime => burstTime > 0)) {
        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0 && !queue.includes(i)) {
                queue.push(i);
            }
        }

        if (queue.length > 0) {
            let currentProcess = queue.shift();
            ganttChart += `| P${currentProcess + 1} `;
            let timeSlice = Math.min(remainingBurstTimes[currentProcess], quantum);
            remainingBurstTimes[currentProcess] -= timeSlice;
            currentTime += timeSlice;

            if (remainingBurstTimes[currentProcess] === 0) {
                completionTime[currentProcess] = currentTime;
            }

            for (let i = 0; i < n; i++) {
                if (remainingBurstTimes[i] > 0 && completionTime[i] === 0) {
                    waitingTime[i] += timeSlice;
                }
            }
        }
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }

    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}

//Priority Non-Preemtive
function calculatePriorityNonPreemptive(arrivalTimes, burstTimes, priorities) {
    let n = arrivalTimes.length;
    let waitingTime = new Array(n);
    let turnaroundTime = new Array(n);
    let completionTime = new Array(n);
    let currentTime = 0;
    let ganttChart = '';

    let processes = Array.from({ length: n }, (_, i) => ({
        id: i,
        arrivalTime: arrivalTimes[i],
        burstTime: burstTimes[i],
        priority: priorities[i]
    }));

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (processes.length > 0) {
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime);
        if (availableProcesses.length > 0) {
            let highestPriority = availableProcesses.reduce((prev, curr) => (prev.priority < curr.priority ? prev : curr));
            processes = processes.filter(p => p.id !== highestPriority.id);
            ganttChart += `| P${highestPriority.id + 1} `;
            currentTime += highestPriority.burstTime;
            completionTime[highestPriority.id] = currentTime;
            waitingTime[highestPriority.id] = currentTime - highestPriority.arrivalTime - highestPriority.burstTime;
        } else {
            currentTime++;
        }
    }

    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }

    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}

//Priority Preemtive
function calculatePriorityPreemptive(arrivalTimes, burstTimes, priorities) {
    let n = arrivalTimes.length;
    let remainingBurstTimes = [...burstTimes];
    let waitingTime = new Array(n).fill(0);
    let turnaroundTime = new Array(n).fill(0);
    let completionTime = new Array(n).fill(0);
    let currentTime = 0;
    let ganttChart = '';
    
    // To store process info and keep track of completed processes
    let processes = Array.from({ length: n }, (_, i) => ({
        id: i,
        arrivalTime: arrivalTimes[i],
        burstTime: burstTimes[i],
        remainingBurstTime: remainingBurstTimes[i],
        priority: priorities[i],
        completed: false
    }));

    // Sort processes by arrival time (to simulate time passing)
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let readyQueue = [];
    let lastExecuted = -1;  // Track the last executed process to update gantt chart
    
    while (true) {
        // Add processes that have arrived up until the current time
        for (let i = 0; i < n; i++) {
            if (processes[i].arrivalTime <= currentTime && !processes[i].completed) {
                readyQueue.push(processes[i]);
            }
        }

        // If no process is ready to execute, increment the time and continue
        if (readyQueue.length === 0) {
            currentTime++;
            continue;
        }

        // Sort the readyQueue by priority (lowest priority number has highest priority)
        readyQueue.sort((a, b) => a.priority - b.priority);

        // Select the highest priority process
        let currentProcess = readyQueue.shift();

        // Execute the current process for 1 unit of time (preemptive)
        if (lastExecuted !== currentProcess.id) {
            ganttChart += `| P${currentProcess.id + 1} `;
            lastExecuted = currentProcess.id;
        }

        currentProcess.remainingBurstTime--;
        currentTime++;

        // If the process is completed, mark its completion time
        if (currentProcess.remainingBurstTime === 0) {
            currentProcess.completed = true;
            completionTime[currentProcess.id] = currentTime;
        }

        // Update waiting time for the other processes in the readyQueue
        readyQueue.forEach(process => {
            if (process.remainingBurstTime > 0) {
                waitingTime[process.id]++;
            }
        });

        // If all processes are completed, break out of the loop
        if (processes.every(process => process.completed)) {
            break;
        }
    }

    // Calculate turnaround time for each process
    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - arrivalTimes[i];
    }

    // Calculate average waiting time and turnaround time
    let totalWaitingTime = waitingTime.reduce((sum, time) => sum + time, 0);
    let totalTurnaroundTime = turnaroundTime.reduce((sum, time) => sum + time, 0);
    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnaroundTime = totalTurnaroundTime / n;

    // Format the results
    let result = 'Process  Arrival  Burst  Waiting  Turnaround\n';
    for (let i = 0; i < n; i++) {
        result += `${i + 1}       ${arrivalTimes[i]}       ${burstTimes[i]}      ${waitingTime[i]}       ${turnaroundTime[i]}\n`;
    }

    result += `\nGantt Chart:\n${ganttChart}\n`;
    result += `\nAverage Waiting Time: ${avgWaitingTime.toFixed(2)}`;
    result += `\nAverage Turnaround Time: ${avgTurnaroundTime.toFixed(2)}`;

    return result;
}
