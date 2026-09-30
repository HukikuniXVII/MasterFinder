"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ContactPage = {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
};

type ContactInput = Omit<Contact, "id">;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const DEFAULT_PAGE_SIZE = 8;
const EMPTY_FORM: ContactInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(body?.message ?? "The request could not be completed.");
  }
  return response.json() as Promise<T>;
}

export default function Home() {
  const [result, setResult] = useState<ContactPage>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageSizeInput, setPageSizeInput] = useState(String(DEFAULT_PAGE_SIZE));
  const [dialogContact, setDialogContact] = useState<Contact | null | undefined>();
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    request<ContactPage>(`/contacts?page=${page}&limit=${pageSize}`)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to connect to the contacts service.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, pageSize]);

  function openCreate() {
    setDetailContact(null);
    setDialogContact(null);
    setForm(EMPTY_FORM);
  }

  function openEdit(contact: Contact) {
    setDetailContact(null);
    setDialogContact(contact);
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    });
  }

  function closeDialog() {
    setDialogContact(undefined);
    setError("");
  }

  async function refresh() {
    const data = await request<ContactPage>(
      `/contacts?page=${page}&limit=${pageSize}`,
    );
    setResult(data);
  }

  function applyPageSize() {
    const parsed = Number(pageSizeInput);
    const nextPageSize = Number.isInteger(parsed)
      ? Math.min(100, Math.max(1, parsed))
      : pageSize;
    setPageSizeInput(String(nextPageSize));
    setPageSize(nextPageSize);
    setPage(1);
  }

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (dialogContact) {
        await request<Contact>(`/contacts/${dialogContact.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await request<Contact>("/contacts", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      closeDialog();
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save this contact.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteContact(contact?: Contact) {
    const targetContact = contact ?? dialogContact;
    if (!targetContact) return;
    setSaving(true);
    setError("");
    try {
      await request<void>(`/contacts/${targetContact.id}`, { method: "DELETE" });
      const nextPage = page > 1 && result.data.length === 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await refresh();
      if (dialogContact?.id === targetContact.id) closeDialog();
      if (detailContact?.id === targetContact.id) setDetailContact(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete this contact.",
      );
    } finally {
      setSaving(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(result.total / pageSize));
  const firstRecord = result.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, result.total);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Northstar contacts home">
          <span className="brand-mark">N</span>
          <span>northstar<span className="wordmark-light"> / people</span></span>
        </a>
        <span className="topbar-note">DIRECTORY <span>•</span> CONTACTS</span>
      </header>

      <section className="workspace" id="top">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PEOPLE OPERATIONS <span>—</span> 01</p>
            <h1>Contact directory</h1>
            <p className="subtitle">A clear view of the people in your network.</p>
          </div>
          <button className="primary-button" onClick={openCreate} type="button">
            <span className="plus-mark" aria-hidden="true">+</span> Add contact
          </button>
        </div>

        <div className="directory-toolbar">
          <div className="list-label"><span className="status-dot" /> ALL CONTACTS <span className="count-chip">{result.total}</span></div>
          <span className="sync-label">MASTER DIRECTORY</span>
        </div>

        {error && dialogContact === undefined && !detailContact && (
          <div className="notice" role="alert">{error}</div>
        )}

        <div className="table-frame">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th className="action-heading">OPERATIONS</th>
                  <th>MASTER ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <tr className="skeleton-row" key={index}>
                      <td colSpan={5}><span /></td>
                    </tr>
                  ))
                ) : result.data.length > 0 ? (
                  result.data.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <button
                          className="delete-icon-button"
                          onClick={() => deleteContact(contact)}
                          type="button"
                          aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                          title="Delete contact"
                        >
                          <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                      </td>
                      <td><span className="master-id">{String(contact.id).padStart(6, "0")}</span></td>
                      <td className="name-cell"><button className="name-link" type="button" onClick={() => setDetailContact(contact)}>{contact.firstName} {contact.lastName}</button></td>
                      <td className="email-cell">{contact.email}</td>
                      <td className="phone-cell">{contact.phone}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="empty-state" colSpan={5}>No contacts yet. Add someone to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>SHOWING <strong>{firstRecord}–{lastRecord}</strong> OF <strong>{result.total}</strong></span>
            <div className="pagination">
              <label className="page-size-control"><span>ROWS</span><input aria-label="Rows per page" type="number" min="1" max="100" step="1" value={pageSizeInput} onChange={(event) => setPageSizeInput(event.target.value)} onBlur={applyPageSize} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } }} /><span>PER PAGE</span></label>
              <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>←</button>
              <span>PAGE <strong>{page}</strong> OF <strong>{pageCount}</strong></span>
              <button type="button" aria-label="Next page" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>→</button>
            </div>
          </footer>
        </div>
        <p className="page-footnote">MASTER REGISTER <span>·</span> UPDATED AUTOMATICALLY</p>
      </section>

      {detailContact && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailContact(null); }}>
          <section className="contact-dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="dialog-heading">
              <div>
                <p className="eyebrow">MASTER ID {String(detailContact.id).padStart(6, "0")}</p>
                <h2 id="detail-title">Contact details</h2>
              </div>
              <button className="close-button" type="button" onClick={() => setDetailContact(null)} aria-label="Close dialog">×</button>
            </div>
            <dl className="detail-list">
              <div><dt>Name</dt><dd>{detailContact.firstName} {detailContact.lastName}</dd></div>
              <div><dt>Email</dt><dd>{detailContact.email}</dd></div>
              <div><dt>Phone</dt><dd>{detailContact.phone}</dd></div>
            </dl>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="dialog-actions">
              <button className="delete-button" disabled={saving} type="button" onClick={() => deleteContact(detailContact)} aria-label="Delete contact"><Trash2 size={15} aria-hidden="true" /> Delete</button>
              <span className="action-spacer" />
              <button className="secondary-button" type="button" onClick={() => setDetailContact(null)}>Close</button>
              <button className="primary-button" type="button" onClick={() => openEdit(detailContact)}>Edit contact</button>
            </div>
          </section>
        </div>
      )}

      {dialogContact !== undefined && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="dialog-heading">
              <div>
                <p className="eyebrow">{dialogContact ? `MASTER ID ${String(dialogContact.id).padStart(6, "0")}` : "NEW RECORD"}</p>
                <h2 id="dialog-title">{dialogContact ? "Edit contact" : "Add a contact"}</h2>
              </div>
              <button className="close-button" type="button" onClick={closeDialog} aria-label="Close dialog">×</button>
            </div>
            <form onSubmit={saveContact}>
              <div className="form-grid">
                <label>First name<input autoFocus autoComplete="given-name" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
                <label>Last name<input autoComplete="family-name" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
                <label className="full-field">Email<input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
                <label className="full-field">Phone<input autoComplete="tel" type="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="dialog-actions">
                {dialogContact && <button className="delete-button" disabled={saving} type="button" onClick={() => deleteContact()}>Delete contact</button>}
                <span className="action-spacer" />
                <button className="secondary-button" disabled={saving} type="button" onClick={closeDialog}>Cancel</button>
                <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving…" : "Save contact"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
