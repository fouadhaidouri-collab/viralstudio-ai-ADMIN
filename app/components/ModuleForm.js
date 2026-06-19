"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function ModuleForm({ fields, requiredFields, values, onChange, disabled }) {
  const handleChange = (name, val) => {
    onChange({ ...values, [name]: val });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const isRequired = requiredFields?.includes(field.name);
        const val = values[field.name] ?? field.default ?? "";

        if (field.type === "select") {
          return (
            <div key={field.name}>
              <Label field={field} required={isRequired} />
              <select
                value={val}
                onChange={(e) => handleChange(field.name, e.target.value)}
                disabled={disabled}
                className="w-full bg-surface-container-lowest border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === "boolean") {
          return (
            <div key={field.name} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!val}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 rounded border-surface-border bg-surface-container-lowest focus:ring-primary"
              />
              <Label field={field} required={isRequired} />
            </div>
          );
        }

        if (field.type === "number") {
          return (
            <div key={field.name}>
              <Label field={field} required={isRequired} />
              <input
                type="number"
                value={val}
                onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
                disabled={disabled}
                min={field.constraints?.minimum}
                max={field.constraints?.maximum}
                step={field.constraints?.multipleOf || "any"}
                className="w-full bg-surface-container-lowest border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
              />
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.name}>
              <Label field={field} required={isRequired} />
              <textarea
                value={val}
                onChange={(e) => handleChange(field.name, e.target.value)}
                disabled={disabled}
                rows={4}
                className="w-full bg-surface-container-lowest border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none disabled:opacity-50"
                placeholder={field.description || `Enter ${field.label}`}
              />
            </div>
          );
        }

        if (field.type === "url") {
          return (
            <div key={field.name}>
              <Label field={field} required={isRequired} />
              <input
                type="url"
                value={val}
                onChange={(e) => handleChange(field.name, e.target.value)}
                disabled={disabled}
                placeholder="https://..."
                className="w-full bg-surface-container-lowest border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
              />
            </div>
          );
        }

        if (field.type === "array" && field.options) {
          return (
            <div key={field.name}>
              <Label field={field} required={isRequired} />
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const selected = Array.isArray(val) && val.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const arr = Array.isArray(val) ? [...val] : [];
                        const idx = arr.indexOf(opt.value);
                        if (idx >= 0) arr.splice(idx, 1);
                        else arr.push(opt.value);
                        handleChange(field.name, arr);
                      }}
                      disabled={disabled}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-surface-container-high border-surface-border text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div key={field.name}>
            <Label field={field} required={isRequired} />
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={disabled}
              placeholder={field.description || `Enter ${field.label}`}
              className="w-full bg-surface-container-lowest border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
            />
          </div>
        );
      })}
    </div>
  );
}

function Label({ field, required }) {
  const icons = {
    select: "list",
    boolean: "toggle",
    number: "tag",
    textarea: "edit_note",
    url: "link",
    array: "view_column",
    text: "text_fields",
    object: "category",
  };

  return (
    <label className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1.5 font-medium">
      <Icon name={icons[field.type] || "text_fields"} className="text-[10px]" />
      {field.label || field.name}
      {required && <span className="text-red-400">*</span>}
      {field.description && (
        <span className="text-on-surface-variant/50 ml-1 font-normal" title={field.description}>ⓘ</span>
      )}
    </label>
  );
}
