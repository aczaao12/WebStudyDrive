
import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments, fetchMajors, fetchTags } from '../api/documents';
import { debounce } from 'lodash';

const DOCUMENTS_PER_PAGE = 10; // Define a constant for pagination limit

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [tagFilters, setTagFilters] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [documents, setDocuments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch initial majors and tags
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const fetchedMajors = await fetchMajors();
        setMajors(fetchedMajors);
        const fetchedTags = await fetchTags();
        setTags(fetchedTags);
      } catch (err) {
        console.error("Failed to fetch majors or tags:", err);
        setError("Failed to load filter options.");
      }
    };
    loadFilters();
  }, []);

  const executeSearch = useCallback(async (newSearchTerm, newMajorFilter, newTagFilters, newSortBy, loadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentLastDoc = loadMore ? lastDoc : null;
      const { documents: newDocuments, lastDoc: newLastDoc } = await fetchDocuments(
        newSearchTerm,
        newMajorFilter,
        newTagFilters.map(tag => tag.id), // Pass only IDs to Firestore
        newSortBy,
        currentLastDoc,
        DOCUMENTS_PER_PAGE // Pass the limitCount
      );

      setDocuments(prevDocs => (loadMore ? [...prevDocs, ...newDocuments] : newDocuments));
      setLastDoc(newLastDoc);
      setHasMore(newDocuments.length === DOCUMENTS_PER_PAGE); // More accurate check
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  // Debounced search for searchTerm changes
  const debouncedSearchTerm = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      executeSearch(term, majorFilter, tagFilters, sortBy, false);
    }, 500),
    [majorFilter, tagFilters, sortBy, executeSearch]
  );

  // Effect to trigger search when filters or sort order change (not searchTerm)
  useEffect(() => {
    if (searchTerm !== '') { // Only re-run if there's an active search term
      executeSearch(searchTerm, majorFilter, tagFilters, sortBy, false);
    }
  }, [majorFilter, tagFilters, sortBy, searchTerm, executeSearch]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      executeSearch(searchTerm, majorFilter, tagFilters, sortBy, true);
    }
  };

  return {
    searchTerm,
    setSearchTerm: debouncedSearchTerm,
    majorFilter,
    setMajorFilter,
    tagFilters,
    setTagFilters,
    sortBy,
    setSortBy,
    documents,
    majors,
    tags,
    loading,
    error,
    hasMore,
    handleLoadMore,
  };
};

export default useSearch;
