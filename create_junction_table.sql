-- Create the junction table for Project-User assignments
CREATE TABLE IF NOT EXISTS "_ProjectAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on both columns
CREATE UNIQUE INDEX IF NOT EXISTS "_ProjectAssignments_AB_unique" ON "_ProjectAssignments"("A", "B");

-- Create index on B column
CREATE INDEX IF NOT EXISTS "_ProjectAssignments_B_index" ON "_ProjectAssignments"("B");
