import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getSessionById, getTags, searchSessions } from "../../api/sessionApi";
import type { Session, SearchSessionRequest } from "../../types";
import { queryClient } from "../../queryClient";
import Layout from "../../components/Layout";

const PAGE_SIZE_DEFAULT = 9;
const FILTER_OPTIONS: (keyof SearchSessionRequest)[] = [
  "titleContains",
  "creatorId",
  "tagsInclude",
  "startAfter",
  "startBefore",
  "minDuration",
  "maxDuration",
  "sortBy",
  "sortOrder",
];

export default function SearchSession() {
  const [activeFilters, setActiveFilters] = useState<(keyof SearchSessionRequest)[]>([]);
  const [filterValues, setFilterValues] = useState<Partial<SearchSessionRequest>>({
    page: 0,
    size: PAGE_SIZE_DEFAULT,
    sortBy: "start",
    sortOrder: "asc",
  });
  const [pageData, setPageData] = useState<{ items: Session[]; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [isTagsError, setIsTagsError] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
            setShowTagDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        }, []);


  useEffect(() => {
        const fetchTags = async () => {
        setIsTagsLoading(true);
        setIsTagsError(false);
        try {
            const data = await getTags();
            setAvailableTags(data);
        } catch (err) {
            console.error("Failed to fetch tags:", err);
            setIsTagsError(true);
        } finally {
            setIsTagsLoading(false);
        }
        };
        fetchTags();
    }, []);

  // Add or remove a filter
  const toggleFilter = (filter: keyof SearchSessionRequest) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
      setFilterValues((prev) => {
        const updated = { ...prev };
        delete updated[filter];
        return updated;
      });
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Update filter values
  const updateFilterValue = (key: keyof SearchSessionRequest, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  // Build API body with only non-empty values
  const buildRequestBody = (): SearchSessionRequest => {
    const body: SearchSessionRequest = {} as any;
    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        (body as any)[key] = value;
      }
    });
    return body;
  };

  // Manual search trigger
    const handleSearch = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
        const body = buildRequestBody();
        body.page = 0; // always start from the first page
        const result = await searchSessions(body);
        setPageData(result);
        setFilterValues((prev) => ({ ...prev, page: 0 }));
    } catch (err) {
        console.error("Search failed:", err);
        setIsError(true);
    } finally {
        setIsLoading(false);
    }
    };


  // Pagination
    const handlePageChange = async (newPage: number) => {
    const body = buildRequestBody();
    body.page = newPage; // ensure correct page
    setFilterValues((prev) => ({ ...prev, page: newPage }));

    setIsLoading(true);
    setIsError(false);
    try {
        console.log("Fetching page:", newPage, "with body:", body);
        const result = await searchSessions(body);
        setPageData(result);
    } catch (err) {
        console.error("Pagination failed:", err);
        setIsError(true);
    } finally {
        setIsLoading(false);
    }
    };


  // Prefetch single session
  const prefetchSession = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["session", id],
      queryFn: () => getSessionById(id),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-8 px-6">
          <h1 className="text-3xl font-semibold mb-2">Search Sessions</h1>
          <p className="opacity-90 text-lg">Add filters and search sessions below</p>
        </div>

        <div className="p-6 md:p-10">
          {/* Add Filter Dropdown */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <select
              className="px-3 py-2 border rounded-lg text-gray-900"
              value=""
              onChange={(e) => toggleFilter(e.target.value as keyof SearchSessionRequest)}
            >
              <option value="" disabled>
                Add Filter...
              </option>
              {FILTER_OPTIONS.filter((f) => !activeFilters.includes(f)).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>

          {/* Active Filters as Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {activeFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-2 bg-indigo-50 border border-indigo-300 rounded-full px-4 py-2 shadow-sm text-gray-900"
              >
                <span className="font-medium text-indigo-700">{filter}:</span>
                {filter === "tagsInclude" ? (
                    <div ref={tagDropdownRef} className="relative tag-filter dropdown">
                        <div
                        className="flex items-center flex-wrap gap-2 px-2 py-1 border rounded-md bg-white cursor-text min-w-[250px]"
                        onClick={() => setShowTagDropdown(true)}
                        >
                        {/* Selected tags */}
                        {filterValues.tagsInclude && filterValues.tagsInclude.length > 0 ? (
                            filterValues.tagsInclude.map((tag) => (
                            <span
                                key={tag}
                                className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                            >
                                {tag}
                                <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateFilterValue(
                                    "tagsInclude",
                                    filterValues.tagsInclude!.filter((t) => t !== tag)
                                    );
                                }}
                                className="text-red-500 hover:text-red-700 font-bold ml-1"
                                >
                                ×
                                </button>
                            </span>
                            ))
                        ) : (
                            <span className="text-gray-900 italic">Add tags...</span>
                        )}

                        {/* Search input */}
                        <input
                            type="text"
                            className="flex-1 outline-none text-sm text-gray-900"
                            placeholder="Search tags..."
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            onFocus={() => setShowTagDropdown(true)}
                        />
                        </div>

                        {/* Dropdown menu */}
                        {showTagDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {isTagsLoading ? (
                            <div className="p-2 text-sm text-gray-900">Loading tags...</div>
                            ) : isTagsError ? (
                            <div className="p-2 text-sm text-red-500">Failed to load tags</div>
                            ) : filteredTags.length === 0 ? (
                            <div className="p-2 text-sm text-gray-900 italic">No tags found</div>
                            ) : (
                            filteredTags.map((tag) => (
                                <label
                                key={tag}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-900"
                                >
                                <input
                                    type="checkbox"
                                    checked={filterValues.tagsInclude?.includes(tag) || false}
                                    onChange={() => {
                                    const currentTags = filterValues.tagsInclude || [];
                                    const updatedTags = currentTags.includes(tag)
                                        ? currentTags.filter((t) => t !== tag)
                                        : [...currentTags, tag];
                                    updateFilterValue("tagsInclude", updatedTags);
                                    }}
                                />
                                {tag}
                                </label>
                            ))
                            )}
                        </div>
                        )}
                    </div>
                ) : filter === "startAfter" || filter === "startBefore" ? (
                  <input
                    type="datetime-local"
                    className="px-2 py-1 border rounded-md"
                    value={(filterValues[filter] as string) || ""}
                    onChange={(e) => updateFilterValue(filter, e.target.value)}
                  />
                ) : filter === "minDuration" || filter === "maxDuration" ? (
                  <input
                    type="number"
                    min={1}
                    className="px-2 py-1 border rounded-md w-24"
                    value={(filterValues[filter] as number) || ""}
                    onChange={(e) =>
                      updateFilterValue(filter, e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                ) : filter === "sortBy" ? (
                  <select
                    className="px-2 py-1 border rounded-md"
                    value={filterValues.sortBy || ""}
                    onChange={(e) => updateFilterValue("sortBy", e.target.value as any)}
                  >
                    <option value="start">Start</option>
                    <option value="duration">Duration</option>
                    <option value="title">Title</option>
                    <option value="creator_id">Creator</option>
                  </select>
                ) : filter === "sortOrder" ? (
                  <select
                    className="px-2 py-1 border rounded-md"
                    value={filterValues.sortOrder || "asc"}
                    onChange={(e) =>
                      updateFilterValue("sortOrder", e.target.value as "asc" | "desc")
                    }
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={filter}
                    className="px-2 py-1 border rounded-md"
                    value={(filterValues[filter] as string) || ""}
                    onChange={(e) => updateFilterValue(filter, e.target.value)}
                  />
                )}
                <button
                  onClick={() => toggleFilter(filter)}
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Page Size & Navigation */}
          {pageData && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <label className="text-gray-900 font-medium">Page Size:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="w-20 px-2 py-1 border rounded-md"
                  value={filterValues.size || PAGE_SIZE_DEFAULT}
                  onChange={(e) =>
                    updateFilterValue("size", e.target.value ? parseInt(e.target.value) : PAGE_SIZE_DEFAULT)
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  disabled={(filterValues.page || 0) === 0}
                  onClick={() => handlePageChange((filterValues.page || 0) - 1)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-200 rounded-lg">
                  Page {(filterValues.page || 0) + 1} of {pageData.totalPages}
                </span>
                <button
                  disabled={(filterValues.page || 0) >= pageData.totalPages - 1}
                  onClick={() => handlePageChange((filterValues.page || 0) + 1)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center text-gray-900 italic py-10">Loading sessions...</div>
          ) : isError ? (
            <div className="text-center text-red-500 py-10">Failed to load sessions.</div>
          ) : !pageData ? (
            <div className="text-center text-gray-900 italic py-10">
              Choose filters and click <b>Search</b> to get results.
            </div>
          ) : pageData.items.length === 0 ? (
            <div className="text-center text-gray-900 italic">No sessions found.</div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.items.map((s) => (
                <li
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <Link
                    to={`/sessions/${s.id}/view`}
                    onMouseEnter={() => prefetchSession(s.id)}
                    onFocus={() => prefetchSession(s.id)}
                    className="block"
                  >
                    <h2 className="text-xl font-semibold text-indigo-700 mb-1">{s.title}</h2>
                    <p className="text-sm text-gray-900 mb-2">By: {s.creatorId}</p>
                    <p className="text-sm text-gray-900 mb-3">
                      Start: {new Date(s.start).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};
