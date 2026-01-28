"use client";

import { useState, useEffect, DragEvent, useCallback, useRef } from "react";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
};

type TableData = {
  id: string;
  name: string;
  capacity: number;
  guests: string[]; // guest IDs
};

type SeatingState = {
  tables: TableData[];
  unassigned: string[]; // guest IDs
  removed: string[]; // guest IDs that have been removed
  customGuests: Guest[]; // guests added by the user
};

const ALL_GUESTS: Guest[] = [
  { id: "1", firstName: "Ulysis", lastName: "Chomapoy" },
  { id: "2", firstName: "Beatrice", lastName: "Chomapoy" },
  { id: "3", firstName: "Abegail", lastName: "Chomapoy" },
  { id: "4", firstName: "Ezekiel", lastName: "Chomapoy" },
  { id: "5", firstName: "Heidi", lastName: "Palaleo" },
  { id: "6", firstName: "Susan", lastName: "Docyogen" },
  { id: "7", firstName: "Andres", lastName: "Docyogen" },
  { id: "8", firstName: "Karen Faith", lastName: "Docyogen" },
  { id: "9", firstName: "Jahzeel Queen", lastName: "Ban-ang" },
  { id: "10", firstName: "Roxanne", lastName: "Hernaez" },
  { id: "11", firstName: "Butrous", lastName: "Kibara" },
  { id: "12", firstName: "Esther", lastName: "Fang" },
  { id: "13", firstName: "Angel", lastName: "Calang-ad" },
  { id: "14", firstName: "Jon", lastName: "Boland" },
  { id: "15", firstName: "Virginia", lastName: "Boland" },
  { id: "16", firstName: "Enrico", lastName: "Marquez" },
  { id: "17", firstName: "Joan", lastName: "Marquez" },
  { id: "18", firstName: "Jimmy", lastName: "Marquez" },
  { id: "19", firstName: "Skye", lastName: "Marquez" },
  { id: "21", firstName: "Nestor", lastName: "Agtina" },
  { id: "22", firstName: "Gie", lastName: "Canuto-Agtina" },
  { id: "23", firstName: "Sam", lastName: "Haber" },
  { id: "24", firstName: "Melchora", lastName: "Chin" },
  { id: "25", firstName: "Agnes", lastName: "Cibic" },
  { id: "26", firstName: "Mitchel", lastName: "Chin" },
  { id: "27", firstName: "Julie", lastName: "Rehbaum" },
  { id: "28", firstName: "Isabel", lastName: "Hooley" },
  { id: "29", firstName: "Elvies", lastName: "Dadat" },
  { id: "30", firstName: "Jannen", lastName: "Beg-asan" },
  { id: "31", firstName: "Armin", lastName: "Maniago" },
  { id: "32", firstName: "Reggie", lastName: "Maniago" },
  { id: "33", firstName: "Michelle", lastName: "Emery" },
  { id: "34", firstName: "Ruby", lastName: "Emery" },
  { id: "35", firstName: "Ava", lastName: "Withjoy" },
  { id: "36", firstName: "Paschience", lastName: "Withjoy" },
  { id: "37", firstName: "Charlotte", lastName: "Kummer" },
  { id: "38", firstName: "Mark", lastName: "Webb" },
  { id: "39", firstName: "Kerry", lastName: "Webb" },
  { id: "40", firstName: "Luke", lastName: "Webb" },
  { id: "41", firstName: "Christina", lastName: "Webb" },
  { id: "42", firstName: "William", lastName: "Webb" },
  { id: "43", firstName: "Samuel", lastName: "Webb" },
  { id: "44", firstName: "Jessica", lastName: "Heikkinen" },
  { id: "46", firstName: "Hugo", lastName: "Heikkinen" },
  { id: "48", firstName: "Shane", lastName: "Styles" },
  { id: "49", firstName: "Belinda", lastName: "Styles" },
  { id: "50", firstName: "Daniel", lastName: "Mclean" },
  { id: "51", firstName: "Rhiannon", lastName: "Mclean" },
  { id: "52", firstName: "Owen", lastName: "Fox" },
  { id: "53", firstName: "Mira", lastName: "Fox" },
  { id: "54", firstName: "Tim", lastName: "Hazra" },
  { id: "55", firstName: "Bec", lastName: "Hazra" },
  { id: "56", firstName: "Moria", lastName: "Hazra" },
  { id: "57", firstName: "Marlia", lastName: "Hazra" },
  { id: "58", firstName: "Graham", lastName: "Reibelt" },
  { id: "59", firstName: "Ros", lastName: "Reibelt" },
  { id: "60", firstName: "Robert", lastName: "Schilt" },
  { id: "61", firstName: "Vel", lastName: "Schilt" },
  { id: "62", firstName: "Maria", lastName: "Curran" },
  { id: "63", firstName: "Brian", lastName: "Curran" },
  { id: "64", firstName: "Ben (Pastor)", lastName: "Lassator" },
  { id: "65", firstName: "Sharon", lastName: "Lassator" },
  { id: "66", firstName: "Eli", lastName: "Lassator" },
  { id: "67", firstName: "Samuel", lastName: "Lassator" },
  { id: "68", firstName: "Emily", lastName: "Lassator" },
  { id: "69", firstName: "Billy", lastName: "Almond" },
  { id: "70", firstName: "Eloise", lastName: "Craig" },
  { id: "71", firstName: "Dylan", lastName: "Wood" },
  { id: "72", firstName: "Taylor", lastName: "Simpson" },
  { id: "73", firstName: "Lisa", lastName: "Whitten" },
];

// Bride and groom - always on bridal table, not draggable
const BRIDAL_PARTY = ["Matt", "Rachel"];

const DEFAULT_TABLES: TableData[] = [
  { id: "bridal", name: "Bridal Table", capacity: 2, guests: [] },
  { id: "table1", name: "Table 1", capacity: 10, guests: [] },
  { id: "table2", name: "Table 2", capacity: 10, guests: [] },
  { id: "table3", name: "Table 3", capacity: 10, guests: [] },
  { id: "table4", name: "Table 4", capacity: 10, guests: [] },
  { id: "table5", name: "Table 5", capacity: 10, guests: [] },
  { id: "table6", name: "Table 6", capacity: 10, guests: [] },
  { id: "table7", name: "Table 7", capacity: 10, guests: [] },
  { id: "table8", name: "Table 8", capacity: 10, guests: [] },
];

function mergeWithDefaults(saved: SeatingState): SeatingState {
  const savedTables = saved.tables ?? [];
  const tables = DEFAULT_TABLES.map((defaultTable) => {
    const savedTable = savedTables.find((t) => t.id === defaultTable.id);
    return {
      ...defaultTable,
      guests: savedTable?.guests ?? [],
    };
  });

  return {
    tables,
    unassigned: saved.unassigned ?? [],
    removed: saved.removed ?? [],
    customGuests: saved.customGuests ?? [],
  };
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveRetryNonce, setSaveRetryNonce] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tables, setTables] = useState<TableData[]>(DEFAULT_TABLES);
  const [unassigned, setUnassigned] = useState<string[]>(ALL_GUESTS.map((g) => g.id));
  const [removed, setRemoved] = useState<string[]>([]);
  const [customGuests, setCustomGuests] = useState<Guest[]>([]);
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState("");

  const getGuestById = useCallback(
    (id: string) => ALL_GUESTS.find((g) => g.id === id) ?? customGuests.find((g) => g.id === id),
    [customGuests]
  );

  // No localStorage usage; require login each session
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Save to API with debounce
  const saveToApi = useCallback(async (state: SeatingState, pwd: string) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/seating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-password": pwd,
        },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        setSaveError(`Save failed (${response.status})`);
        return false;
      }
      setLastSavedAt(new Date());
      return true;
    } catch (error) {
      console.error("Failed to save:", error);
      setSaveError("Save failed (network)");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Debounced save effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const timeoutId = setTimeout(() => {
      const attemptSave = async () => {
        const ok = await saveToApi({ tables, unassigned, removed, customGuests }, password);
        if (ok) return;
        if (!retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            setSaveRetryNonce((n) => n + 1);
          }, 3000);
        }
      };
      void attemptSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [tables, unassigned, removed, customGuests, isAuthenticated, password, saveToApi, saveRetryNonce]);

  async function loadData(pwd: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seating", {
        headers: { "x-app-password": pwd },
      });

      if (response.status === 401) {
        setPasswordError("Incorrect password");
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      const { data } = await response.json();

      if (data) {
        const merged = mergeWithDefaults(data);
        const knownIds = new Set([
          ...ALL_GUESTS.map((g) => g.id),
          ...merged.customGuests.map((g) => g.id),
        ]);
        setTables(
          merged.tables.map((t) => ({
            ...t,
            guests: t.guests.filter((id) => knownIds.has(id)),
          }))
        );
        setUnassigned(merged.unassigned.filter((id) => knownIds.has(id)));
        setRemoved(merged.removed.filter((id) => knownIds.has(id)));
        setCustomGuests(merged.customGuests);
      }

      setIsAuthenticated(true);
      setSaveError(null);
      setLastSavedAt(null);
      setLoadError(null);
      setPasswordError("");
    } catch (error) {
      console.error("Failed to load:", error);
      setIsAuthenticated(false);
      setSaveError("Load failed");
      setLoadError("Failed to load data");
      setPasswordError("");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }
    setLoadError(null);
    loadData(password);
  }

  function handleDragStart(e: DragEvent, guestId: string, source: string) {
    setDraggedGuest(guestId);
    setDragSource(source);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDropOnTable(e: DragEvent, tableId: string) {
    e.preventDefault();
    if (!draggedGuest) return;

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Check capacity (bridal table is special)
    const effectiveCapacity = tableId === "bridal" ? table.capacity - BRIDAL_PARTY.length : table.capacity;
    if (table.guests.length >= effectiveCapacity) return;

    // Remove from source
    if (dragSource === "unassigned") {
      setUnassigned((prev) => prev.filter((id) => id !== draggedGuest));
    } else if (dragSource) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === dragSource
            ? { ...t, guests: t.guests.filter((id) => id !== draggedGuest) }
            : t
        )
      );
    }

    // Add to table
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, guests: [...t.guests, draggedGuest] } : t
      )
    );

    setDraggedGuest(null);
    setDragSource(null);
  }

  function handleDropOnUnassigned(e: DragEvent) {
    e.preventDefault();
    if (!draggedGuest || dragSource === "unassigned") return;

    // Remove from source table
    if (dragSource) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === dragSource
            ? { ...t, guests: t.guests.filter((id) => id !== draggedGuest) }
            : t
        )
      );
    }

    // Add to unassigned
    setUnassigned((prev) => [...prev, draggedGuest]);

    setDraggedGuest(null);
    setDragSource(null);
  }

  function handleClearTable(tableId: string) {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.guests.length === 0) return;

    // Move all guests back to unassigned
    setUnassigned((prev) => [...prev, ...table.guests]);
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, guests: [] } : t))
    );
  }

  function handleAddGuest() {
    const name = newGuestName.trim();
    if (!name) return;

    const parts = name.split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "";
    const id = `custom-${Date.now()}`;

    const newGuest: Guest = { id, firstName, lastName };
    setCustomGuests((prev) => [...prev, newGuest]);
    setUnassigned((prev) => [...prev, id]);
    setNewGuestName("");
  }

  function handleRemoveGuest(guestId: string) {
    // Remove from unassigned and add to removed
    setUnassigned((prev) => prev.filter((id) => id !== guestId));
    setRemoved((prev) => [...prev, guestId]);
  }

  function handleRestoreGuest(guestId: string) {
    // Remove from removed and add back to unassigned
    setRemoved((prev) => prev.filter((id) => id !== guestId));
    setUnassigned((prev) => [...prev, guestId]);
  }

  function handleReset() {
    if (confirm("Reset all seating arrangements? This cannot be undone.")) {
      setTables(DEFAULT_TABLES.map((t) => ({ ...t, guests: [] })));
      setUnassigned([...ALL_GUESTS.map((g) => g.id), ...customGuests.map((g) => g.id)]);
      setRemoved([]);
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-neutral-400">Loading...</div>
      </main>
    );
  }

  // Show password prompt
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-900">
        <form onSubmit={handleLogin} className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 w-80">
          <h1 className="text-xl font-semibold mb-2">Wedding Seating</h1>
          <p className="text-sm text-neutral-400 mb-6">Enter password to continue</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-500 mb-3"
            autoFocus
          />

          {passwordError && (
            <p className="text-red-400 text-sm mb-3">{passwordError}</p>
          )}
          {loadError && (
            <p className="text-red-400 text-sm mb-3">{loadError}</p>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors font-medium"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  const totalGuests = ALL_GUESTS.length + BRIDAL_PARTY.length + customGuests.length - removed.length;
  const assignedCount = totalGuests - unassigned.length;

  return (
    <main className="min-h-screen flex">
      {/* Left Panel - Guest List */}
      <div
        className="w-64 bg-neutral-900 border-r border-neutral-700 flex flex-col h-screen flex-shrink-0"
        onDragOver={handleDragOver}
        onDrop={handleDropOnUnassigned}
      >
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Wedding Seating</h1>
            <div className="text-xs text-right">
              {isSaving && <span className="text-neutral-500">Saving...</span>}
              {!isSaving && saveError && <span className="text-red-400">{saveError}</span>}
              {!isSaving && !saveError && lastSavedAt && (
                <span className="text-neutral-500">Saved {lastSavedAt.toLocaleTimeString()}</span>
              )}
              {!isSaving && !saveError && !lastSavedAt && (
                <span className="text-neutral-600">Idle</span>
              )}
            </div>
          </div>
          <p className="text-sm text-neutral-400 mt-1">11 April</p>
          <div className="mt-3 text-sm">
            <span className="text-emerald-400">{assignedCount}</span>
            <span className="text-neutral-500"> / {totalGuests} seated</span>
          </div>
        </div>

        {/* Add Guest Input */}
        <div className="p-3 border-b border-neutral-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
              placeholder="Add guest..."
              className="flex-1 px-2 py-1.5 text-sm bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-500"
            />
            <button
              onClick={handleAddGuest}
              className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-neutral-700">
          <h2 className="text-sm font-medium text-neutral-400 mb-1">
            Unassigned ({unassigned.length})
          </h2>
          <p className="text-xs text-neutral-500">Drag guests to a table</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {unassigned.length === 0 ? (
            <p className="text-sm text-neutral-600 text-center py-4">
              All guests seated!
            </p>
          ) : (
            <ul className="space-y-1">
              {unassigned
                .map((guestId) => getGuestById(guestId))
                .filter((guest): guest is Guest => guest !== undefined)
                .sort((a, b) => {
                  const lastNameCompare = a.lastName.localeCompare(b.lastName);
                  if (lastNameCompare !== 0) return lastNameCompare;
                  return a.firstName.localeCompare(b.firstName);
                })
                .map((guest) => (
                  <li
                    key={guest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest.id, "unassigned")}
                    className="flex items-center justify-between px-3 py-2 bg-neutral-800 rounded-lg cursor-grab active:cursor-grabbing hover:bg-neutral-700 transition-colors text-sm group"
                  >
                    <span>{guest.lastName}, {guest.firstName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveGuest(guest.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove guest"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Removed Guests Section */}
        {removed.length > 0 && (
          <div className="border-t border-neutral-700">
            <div className="p-3 border-b border-neutral-700">
              <h2 className="text-sm font-medium text-neutral-500">
                Removed ({removed.length})
              </h2>
            </div>
            <div className="max-h-40 overflow-y-auto p-2">
              <ul className="space-y-1">
                {removed
                  .map((guestId) => getGuestById(guestId))
                  .filter((guest): guest is Guest => guest !== undefined)
                  .sort((a, b) => {
                    const lastNameCompare = a.lastName.localeCompare(b.lastName);
                    if (lastNameCompare !== 0) return lastNameCompare;
                    return a.firstName.localeCompare(b.firstName);
                  })
                  .map((guest) => (
                    <li
                      key={guest.id}
                      className="flex items-center justify-between px-3 py-2 bg-neutral-800/50 rounded-lg text-sm text-neutral-500"
                    >
                      <span className="line-through">{guest.lastName}, {guest.firstName}</span>
                      <button
                        onClick={() => handleRestoreGuest(guest.id)}
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                        title="Restore guest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-neutral-700">
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 text-sm border border-red-800 text-red-400 rounded-lg hover:bg-red-950 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Right Panel - Floor Plan */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Stage Area */}
        <div className="flex justify-center mb-2">
          <div className="w-72 h-12 bg-neutral-800 rounded-t-full border border-neutral-600 flex items-center justify-center text-neutral-500 text-sm">
            Stage / Dance Floor
          </div>
        </div>

        {/* Stage Rectangle + Bridal Table */}
        <div className="flex justify-center items-start gap-6 mb-8">
          <div className="w-72 h-16 bg-neutral-800 border border-neutral-600" />

          {/* Bridal Table */}
          <TableCard
            table={tables.find((t) => t.id === "bridal")!}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnTable(e, "bridal")}
            onDragStart={handleDragStart}
            onClearTable={() => handleClearTable("bridal")}
            resolveGuest={getGuestById}
            highlight
          />
        </div>

        {/* Guest Tables - 2 columns like floor plan */}
        <div className="flex justify-center gap-12">
          {/* Left Column: Tables 1-4 */}
          <div className="space-y-4">
            {["table1", "table2", "table3", "table4"].map((id) => {
              const table = tables.find((t) => t.id === id)!;
              return (
                <TableCard
                  key={id}
                  table={table}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnTable(e, id)}
                  onDragStart={handleDragStart}
                  onClearTable={() => handleClearTable(id)}
                  resolveGuest={getGuestById}
                />
              );
            })}
          </div>

          {/* Right Column: Tables 5-8 */}
          <div className="space-y-4">
            {["table5", "table6", "table7", "table8"].map((id) => {
              const table = tables.find((t) => t.id === id)!;
              return (
                <TableCard
                  key={id}
                  table={table}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnTable(e, id)}
                  onDragStart={handleDragStart}
                  onClearTable={() => handleClearTable(id)}
                  resolveGuest={getGuestById}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function TableCard({
  table,
  onDragOver,
  onDrop,
  onDragStart,
  onClearTable,
  resolveGuest,
  highlight,
}: {
  table: TableData;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragStart: (e: DragEvent, guestId: string, source: string) => void;
  onClearTable: () => void;
  resolveGuest: (id: string) => Guest | undefined;
  highlight?: boolean;
}) {
  // Bridal table includes Matt & Rachel
  const totalGuests = highlight ? table.guests.length + BRIDAL_PARTY.length : table.guests.length;
  const isFull = totalGuests >= table.capacity;

  return (
    <div
      className={`rounded-lg border-2 p-3 transition-all ${
        highlight
          ? "bg-rose-950 border-rose-600"
          : isFull
          ? "bg-emerald-950 border-emerald-700"
          : "bg-neutral-800 border-neutral-600"
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${highlight ? "text-rose-200" : ""}`}>
          {table.name}
        </span>
        <div className="flex items-center gap-2">
          {table.guests.length > 0 && (
            <button
              onClick={onClearTable}
              className="text-neutral-500 hover:text-red-400 transition-colors"
              title="Clear table"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isFull
                ? "bg-emerald-600 text-white"
                : totalGuests > 0
                ? "bg-amber-600 text-white"
                : "bg-neutral-700 text-neutral-300"
            }`}
          >
            {totalGuests}/{table.capacity}
          </span>
        </div>
      </div>

      {/* Guest List */}
      <div className="min-h-[180px] space-y-1">
        {/* Bride and Groom - fixed on bridal table */}
        {highlight && BRIDAL_PARTY.map((name) => (
          <div
            key={name}
            className="px-2 py-1 rounded text-xs bg-rose-700 text-rose-100 font-medium"
          >
            {name}
          </div>
        ))}
        {table.guests.length === 0 && !highlight ? (
          <p className="text-xs text-neutral-500 italic">Drop guests here</p>
        ) : (
          table.guests
            .map((guestId) => resolveGuest(guestId))
            .filter((guest): guest is Guest => guest !== undefined)
            .sort((a, b) => {
              const lastNameCompare = a.lastName.localeCompare(b.lastName);
              if (lastNameCompare !== 0) return lastNameCompare;
              return a.firstName.localeCompare(b.firstName);
            })
            .map((guest) => (
              <div
                key={guest.id}
                draggable
                onDragStart={(e) => onDragStart(e, guest.id, table.id)}
                className={`px-2 py-1 rounded text-xs cursor-grab active:cursor-grabbing transition-colors ${
                  highlight
                    ? "bg-rose-900 hover:bg-rose-800"
                    : "bg-neutral-700 hover:bg-neutral-600"
                }`}
              >
                {guest.lastName}, {guest.firstName}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
