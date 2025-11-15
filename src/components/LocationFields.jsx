import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDebounce } from "use-debounce";

/**
 * LocationFields
 * Props:
 *  - type: "pickup" | "delivery" (used for labels & keys)
 *  - value: { province, city, barangay, street, streetDisplay } (optional)
 *  - onChange: (valueObj) => void
 *  - showStreetSearch: boolean (default true)
 *  - required: boolean (default false)
 *
 * NOTE: uses PSGC API for provinces/cities/barangays and Nominatim for street autocomplete.
 * Make sure your app respects Nominatim usage policy (throttle + UA header).
 */

const truncateText = (text, max = 30) =>
  !text ? "" : text.length <= max ? text : text.slice(0, max) + "…";

const LocationFields = ({
  type = "pickup",
  value = {},
  onChange = () => {},
  showStreetSearch = true,
  required = false,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);

  const [streetInput, setStreetInput] = useState(value.streetDisplay || "");
  const [debouncedStreet] = useDebounce(streetInput, 300);
  const [streetOptions, setStreetOptions] = useState([]);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);

  // load provinces once
  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/provinces/")
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
        setProvinceOptions(
          sorted.map((p) => ({
            value: p.name,
            label: truncateText(p.name, 30),
            fullLabel: p.name,
            code: p.code,
          }))
        );
      })
      .catch(() => {});
  }, []);

  // when incoming value.province changes, load cities
  useEffect(() => {
    if (!value.province) {
      setCities([]);
      setCityOptions([]);
      setBarangayOptions([]);
      return;
    }
    const prov = provinces.find(
      (p) => p.name.toLowerCase() === value.province.toLowerCase()
    );
    if (!prov) return;

    fetch(
      `https://psgc.gitlab.io/api/provinces/${prov.code}/cities-municipalities`
    )
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setCities(sorted);
        setCityOptions(
          sorted.map((c) => ({
            value: c.name,
            label: truncateText(c.name, 30),
            fullLabel: c.name,
            code: c.code,
          }))
        );
      })
      .catch(() => {});
  }, [value.province, provinces]);

  // when city changes, load barangays
  useEffect(() => {
    if (!value.city) {
      setBarangayOptions([]);
      return;
    }
    const city = cities.find(
      (c) => c.name.toLowerCase() === value.city.toLowerCase()
    );
    if (!city) return;

    fetch(
      `https://psgc.gitlab.io/api/cities-municipalities/${city.code}/barangays`
    )
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setBarangayOptions(
          sorted.map((b) => ({
            value: b.name,
            label: truncateText(b.name, 30),
            fullLabel: b.name,
            code: b.code,
          }))
        );
      })
      .catch(() => {});
  }, [value.city, cities]);

  // street autocomplete via Nominatim (limited, geared for PH only)
  useEffect(() => {
    let mounted = true;
    const doSearch = async () => {
      if (!debouncedStreet || debouncedStreet.trim().length < 1) {
        setStreetOptions([]);
        setIsLoadingStreet(false);
        return;
      }

      if (!value.city || !value.province) {
        setStreetOptions([]);
        setIsLoadingStreet(false);
        return;
      }

      setIsLoadingStreet(true);

      try {
        // Build location context for better results
        const baseLocation = value.barangay
          ? `${value.barangay}, ${value.city}, ${value.province}, Philippines`
          : `${value.city}, ${value.province}, Philippines`;

        const queries = [
          `${debouncedStreet}, ${baseLocation}`,
          `${debouncedStreet} Street, ${baseLocation}`,
          `${debouncedStreet} Road, ${baseLocation}`,
          `${debouncedStreet} Avenue, ${baseLocation}`,
        ];

        // fetch up to 5 results per query then dedupe
        const fetches = queries.map((q) =>
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q
            )}&countrycodes=ph&limit=5&addressdetails=1`
          ).then((r) => (r.ok ? r.json() : []))
        );
        const resultsArr = await Promise.all(fetches);
        const flat = resultsArr.flat();

        const seen = new Set();
        const opts = flat
          .filter((r) => r.display_name && !seen.has(r.display_name))
          .map((r) => {
            seen.add(r.display_name);
            return {
              value: r.display_name,
              label:
                r.display_name.split(",")[0].trim() ||
                truncateText(r.display_name, 50),
              fullLabel: r.display_name,
              lat: parseFloat(r.lat),
              lon: parseFloat(r.lon),
              type: r.type || "address",
            };
          })
          .slice(0, 10)
          .sort((a, b) => a.label.localeCompare(b.label));

        if (mounted) setStreetOptions(opts);
      } catch (err) {
        if (mounted) setStreetOptions([]);
      } finally {
        if (mounted) setIsLoadingStreet(false);
      }
    };

    doSearch();
    return () => {
      mounted = false;
    };
  }, [debouncedStreet, value.city, value.province, value.barangay]);

  // helpers to call onChange with merged object
  const partialUpdate = (patch) => {
    const merged = { ...value, ...patch };
    onChange(merged);
  };

  // react-select custom styles to match your "focused border blue" look
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 8,
      minHeight: 40,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,.12)" : "none",
    }),
    option: (base) => ({ ...base, fontSize: 14 }),
  };

  // Render
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label-modern">Province</label>
          <Select
            styles={selectStyles}
            options={provinceOptions}
            value={
              provinceOptions.find((o) => o.value === value.province) || null
            }
            onChange={(o) => {
              partialUpdate({
                province: o ? o.value : "",
                city: "",
                barangay: "",
                street: "",
                streetDisplay: "",
              });
              setStreetInput("");
              setStreetOptions([]);
            }}
            placeholder="Select province"
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
            aria-label={`${type}-province`}
            required={required}
          />
        </div>

        <div>
          <label className="input-label-modern">City / Municipality</label>
          <Select
            styles={selectStyles}
            options={cityOptions}
            value={cityOptions.find((o) => o.value === value.city) || null}
            onChange={(o) => {
              partialUpdate({
                city: o ? o.value : "",
                barangay: "",
                street: "",
                streetDisplay: "",
              });
              setStreetInput("");
              setStreetOptions([]);
            }}
            placeholder="Select city/municipality"
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
            aria-label={`${type}-city`}
            required={required}
          />
        </div>

        <div>
          <label className="input-label-modern">Barangay</label>
          <Select
            styles={selectStyles}
            options={barangayOptions}
            value={
              barangayOptions.find((o) => o.value === value.barangay) || null
            }
            onChange={(o) => {
              partialUpdate({
                barangay: o ? o.value : "",
                street: "",
                streetDisplay: "",
              });
              setStreetInput("");
              setStreetOptions([]);
            }}
            placeholder="Select barangay"
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
            aria-label={`${type}-barangay`}
            required={required}
          />
        </div>

        <div>
          <label className="input-label-modern">Street / Address</label>

          {showStreetSearch ? (
            <>
              <input
                type="text"
                value={streetInput}
                onChange={(e) => setStreetInput(e.target.value)}
                className="modal-input"
                placeholder="Start typing street address..."
                aria-label={`${type}-street-search`}
              />
              {isLoadingStreet && (
                <p className="text-xs text-muted mt-1">Searching addresses…</p>
              )}
              {streetOptions.length > 0 && (
                <div className="mt-2 space-y-1 max-h-40 overflow-auto border rounded-md bg-white p-1">
                  {streetOptions.map((opt, idx) => (
                    <button
                      key={`street-option-${idx}`}
                      type="button"
                      onClick={() => {
                        partialUpdate({
                          street: opt.value,
                          streetDisplay: opt.label || opt.fullLabel,
                        });
                        setStreetInput(opt.label || opt.fullLabel);
                        setStreetOptions([]);
                      }}
                      className="w-full text-left py-1 px-2 rounded hover:bg-gray-100"
                    >
                      <div className="text-sm font-medium">
                        {opt.label || opt.fullLabel}
                      </div>
                      <div className="text-xs text-muted">
                        {opt.fullLabel}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              value={value.street || ""}
              onChange={(e) => partialUpdate({ street: e.target.value })}
              className="modal-input"
              placeholder="Street, house no., unit, etc."
              aria-label={`${type}-street`}
              required={required}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFields;