# College Lost & Found System

A terminal-based lost and found management system using hash tables and circular queues.

## Files

- `hashmap.c` - Hash table implementation for fast searching
- `queue.c` - Queue implementation for fair processing
- `maincode_simple.c` - Main program with terminal interface

## How to Run

```bash
gcc maincode_simple.c -o lost_found.exe
./lost_found.exe
```

## Features

1. Report Lost Items
2. Report Found Items  
3. Search by Item Type
4. Search by Description
5. View All Items
6. Staff Queue Processing
7. Load Sample Data

## Data Structures

### Hash Table
- Fast O(1) search by item type
- Groups similar items together
- Instant matching when items are found

### Circular Queue
- FIFO processing for fairness
- Maintains chronological order
- Ensures no reports are skipped

## How It Works

**Reporting Lost Items:**
- Item stored in hash table for searching
- Added to queue for staff processing
- Automatically checks for matches

**Reporting Found Items:**
- Shows all matching lost items instantly
- Displays owner contact information
- Enables direct communication

**Staff Processing:**
- Processes reports in order received
- Fair FIFO queue ensures equal treatment
- Resolve Found/Lost items based on their ID.
- Hash table enables quick lookups

## Project Structure

```
maincode_simple.c - Main program logic
    ├── hashmap.c - Hash table module
    └── queue.c - Queue module
```
