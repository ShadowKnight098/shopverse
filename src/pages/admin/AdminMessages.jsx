import { useState, useEffect } from 'react'
import { Mail, MailOpen, Eye, Trash2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters.js'

const FILTER_TABS = ['All', 'Unread', 'Read']

export default function AdminMessages() {
  const [messages, setMessages]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeFilter, setActiveFilter]   = useState('All')
  const [viewingMessage, setViewingMessage] = useState(null)
  const [showView, setShowView]           = useState(false)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [showDelete, setShowDelete]       = useState(false)
  const [deleting, setDeleting]           = useState(false)

  async function fetchMessages() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const unreadCount = messages.filter((m) => !m.is_read).length

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'Unread') return !m.is_read
    if (activeFilter === 'Read')   return m.is_read
    return true
  })

  async function markAsRead(message) {
    if (message.is_read) return
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', message.id)
      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
      )
    } catch (err) { console.error(err) }
  }

  function openViewModal(message) {
    setViewingMessage(message)
    setShowView(true)
    markAsRead(message)
  }

  async function handleDelete() {
    if (!deletingMessage) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', deletingMessage.id)
      if (error) throw error
      setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id))
      toast.success('Message deleted')
      setShowDelete(false)
      setDeletingMessage(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AMStyles />
      <div className="am-root">

        {/* ── Header ── */}
        <div className="am-header">
          <div className="am-header-left">
            <div className="am-header-icon">
              <MessageSquare size={20} color="#e8643a" />
            </div>
            <div>
              <h1 className="am-title">Contact Messages</h1>
              <p className="am-subtitle">Manage messages from your customers</p>
            </div>
            {unreadCount > 0 && (
              <span className="am-unread-badge">{unreadCount}</span>
            )}
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="am-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`am-tab ${activeFilter === tab ? 'am-tab--active' : ''}`}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="am-tab-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="am-card">
          {loading ? (
            <div className="am-skeletons">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="am-skeleton-row">
                  <div className="am-skel am-skel--dot" />
                  <div className="am-skel am-skel--name" />
                  <div className="am-skel am-skel--email" />
                  <div className="am-skel am-skel--subject" />
                  <div className="am-skel am-skel--date" />
                  <div className="am-skel am-skel--badge" />
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="am-empty">
              <div className="am-empty-icon">
                <MessageSquare size={28} />
              </div>
              <p className="am-empty-title">No messages found</p>
              <p className="am-empty-sub">
                {activeFilter !== 'All'
                  ? `No ${activeFilter.toLowerCase()} messages yet.`
                  : 'Messages from the contact form will appear here.'}
              </p>
            </div>
          ) : (
            <div className="am-table-wrap">
              <table className="am-table">
                <thead>
                  <tr>
                    <th className="am-th am-th--dot" />
                    <th className="am-th">From</th>
                    <th className="am-th am-th--hide-sm">Email</th>
                    <th className="am-th">Subject</th>
                    <th className="am-th am-th--hide-md">Date</th>
                    <th className="am-th am-th--hide-sm">Status</th>
                    <th className="am-th am-th--right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={`am-row ${!msg.is_read ? 'am-row--unread' : ''}`}
                    >
                      <td className="am-td am-td--dot">
                        <span className={`am-dot ${!msg.is_read ? 'am-dot--on' : ''}`} />
                      </td>
                      <td className={`am-td am-td--name ${!msg.is_read ? 'am-td--bold' : ''}`}>
                        {msg.name}
                      </td>
                      <td className="am-td am-td--muted am-td--hide-sm">
                        {msg.email}
                      </td>
                      <td className={`am-td am-td--subject ${!msg.is_read ? 'am-td--bold' : ''}`}>
                        {msg.subject}
                      </td>
                      <td className="am-td am-td--muted am-td--nowrap am-td--hide-md">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="am-td am-td--hide-sm">
                        {msg.is_read ? (
                          <span className="am-status am-status--read">
                            <MailOpen size={11} /> Read
                          </span>
                        ) : (
                          <span className="am-status am-status--unread">
                            <Mail size={11} /> Unread
                          </span>
                        )}
                      </td>
                      <td className="am-td am-td--actions">
                        <button
                          onClick={() => openViewModal(msg)}
                          className="am-action-btn am-action-btn--view"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => { setDeletingMessage(msg); setShowDelete(true) }}
                          className="am-action-btn am-action-btn--delete"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── View Modal ── */}
        <Modal isOpen={showView} onClose={() => setShowView(false)} title="Message Details" size="lg">
          {viewingMessage && (
            <div className="am-modal-body">
              <div className="am-modal-grid">
                <div className="am-modal-field">
                  <p className="am-modal-label">From</p>
                  <p className="am-modal-value">{viewingMessage.name}</p>
                </div>
                <div className="am-modal-field">
                  <p className="am-modal-label">Email</p>
                  <a href={`mailto:${viewingMessage.email}`} className="am-modal-link">
                    {viewingMessage.email}
                  </a>
                </div>
                <div className="am-modal-field">
                  <p className="am-modal-label">Date</p>
                  <p className="am-modal-value">{formatDate(viewingMessage.created_at)}</p>
                </div>
                <div className="am-modal-field">
                  <p className="am-modal-label">Subject</p>
                  <p className="am-modal-value">{viewingMessage.subject}</p>
                </div>
              </div>

              <div className="am-modal-message-wrap">
                <p className="am-modal-label">Message</p>
                <div className="am-modal-message">
                  <p>{viewingMessage.message}</p>
                </div>
              </div>

              <div className="am-modal-footer">
                <Button variant="ghost" onClick={() => setShowView(false)}>Close</Button>
                <button
                  className="am-reply-btn"
                  onClick={() => {
                    window.location.href = `mailto:${viewingMessage.email}?subject=Re: ${viewingMessage.subject}`
                  }}
                >
                  <Mail size={14} /> Reply via Email
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Delete Modal ── */}
        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Message" size="sm">
          <div className="am-modal-body">
            <p className="am-delete-text">
              Are you sure you want to delete the message from{' '}
              <strong>{deletingMessage?.name}</strong>? This cannot be undone.
            </p>
            <div className="am-modal-footer">
              <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete</Button>
            </div>
          </div>
        </Modal>

      </div>
    </>
  )
}

function AMStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      :root {
        --am-bg:       #faf9f7;
        --am-surface:  #ffffff;
        --am-border:   #ece9e3;
        --am-text:     #18160f;
        --am-text2:    #6b6257;
        --am-text3:    #a8a098;
        --am-accent:   #e8643a;
        --am-accent2:  #c94e22;
        --am-accentl:  rgba(232,100,58,0.1);
        --am-accentb:  rgba(232,100,58,0.22);
        --am-indigo:   #4f46e5;
        --am-indigol:  rgba(79,70,229,0.1);
        --am-red:      #ef4444;
        --am-redl:     rgba(239,68,68,0.1);
        --am-green:    #10b981;
        --am-greenl:   rgba(16,185,129,0.1);
        --ff-head:     'Syne', sans-serif;
        --ff-body:     'DM Sans', sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --am-bg:      #0e0d0b;
          --am-surface: #171512;
          --am-border:  #2a2620;
          --am-text:    #f0ebe3;
          --am-text2:   #948880;
          --am-text3:   #5a5248;
          --am-accentl: rgba(232,100,58,0.12);
          --am-accentb: rgba(232,100,58,0.18);
          --am-indigol: rgba(79,70,229,0.15);
          --am-redl:    rgba(239,68,68,0.12);
          --am-greenl:  rgba(16,185,129,0.1);
        }
      }

      .am-root {
        font-family: var(--ff-body);
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 40px;
      }

      /* ── Header ── */
      .am-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
      .am-header-left { display: flex; align-items: center; gap: 14px; }
      .am-header-icon {
        width: 46px; height: 46px; border-radius: 14px;
        background: var(--am-accentl);
        border: 1.5px solid var(--am-accentb);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .am-title {
        font-family: var(--ff-head);
        font-size: clamp(20px, 3vw, 26px);
        font-weight: 800;
        color: var(--am-text);
        letter-spacing: -0.03em;
        margin: 0;
      }
      .am-subtitle { font-size: 13px; color: var(--am-text2); margin: 2px 0 0; }
      .am-unread-badge {
        display: inline-flex; align-items: center; justify-content: center;
        height: 24px; min-width: 24px; padding: 0 6px;
        background: var(--am-accent); color: #fff;
        font-size: 11px; font-weight: 800;
        border-radius: 9999px;
      }

      /* ── Tabs ── */
      .am-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
      .am-tab {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 8px 16px; border-radius: 10px;
        font-family: var(--ff-body); font-size: 13px; font-weight: 600;
        border: 1.5px solid var(--am-border);
        background: var(--am-surface); color: var(--am-text2);
        cursor: pointer; transition: all 0.18s;
      }
      .am-tab:hover { border-color: var(--am-accent); color: var(--am-accent); }
      .am-tab--active {
        background: var(--am-accent); border-color: var(--am-accent);
        color: #fff;
        box-shadow: 0 3px 12px var(--am-accentb);
      }
      .am-tab-count {
        display: inline-flex; align-items: center; justify-content: center;
        height: 18px; min-width: 18px; padding: 0 4px;
        background: rgba(255,255,255,0.25); color: #fff;
        font-size: 10px; font-weight: 800; border-radius: 9999px;
      }
      .am-tab:not(.am-tab--active) .am-tab-count {
        background: var(--am-accentl); color: var(--am-accent);
      }

      /* ── Card ── */
      .am-card {
        background: var(--am-surface);
        border: 1.5px solid var(--am-border);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 2px 16px rgba(0,0,0,0.04);
      }

      /* ── Skeleton ── */
      .am-skeletons { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
      .am-skeleton-row { display: flex; align-items: center; gap: 16px; }
      .am-skel {
        background: var(--am-border);
        border-radius: 6px;
        animation: amPulse 1.4s ease-in-out infinite;
        height: 12px;
      }
      .am-skel--dot    { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
      .am-skel--name   { width: 100px; }
      .am-skel--email  { width: 150px; }
      .am-skel--subject { width: 180px; flex: 1; }
      .am-skel--date   { width: 90px; }
      .am-skel--badge  { width: 60px; height: 20px; border-radius: 9999px; }

      /* ── Empty ── */
      .am-empty {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 64px 24px; text-align: center;
      }
      .am-empty-icon {
        width: 60px; height: 60px; border-radius: 18px;
        background: var(--am-accentl); border: 1.5px solid var(--am-accentb);
        display: flex; align-items: center; justify-content: center;
        color: var(--am-accent); margin-bottom: 16px;
      }
      .am-empty-title {
        font-family: var(--ff-head); font-size: 16px; font-weight: 800;
        color: var(--am-text); margin: 0 0 6px; letter-spacing: -0.02em;
      }
      .am-empty-sub { font-size: 13px; color: var(--am-text2); margin: 0; }

      /* ── Table ── */
      .am-table-wrap { overflow-x: auto; }
      .am-table { width: 100%; border-collapse: collapse; }

      .am-th {
        padding: 12px 16px;
        text-align: left;
        font-size: 10px; font-weight: 800;
        color: var(--am-text3);
        letter-spacing: 0.08em; text-transform: uppercase;
        border-bottom: 1.5px solid var(--am-border);
        white-space: nowrap;
        background: var(--am-bg);
      }
      .am-th--dot   { width: 32px; padding: 12px 8px 12px 20px; }
      .am-th--right { text-align: right; padding-right: 20px; }

      .am-row {
        transition: background 0.15s;
        border-bottom: 1px solid var(--am-border);
      }
      .am-row:last-child { border-bottom: none; }
      .am-row:hover { background: var(--am-accentl); }
      .am-row--unread { background: rgba(232,100,58,0.04); }
      .am-row--unread:hover { background: var(--am-accentl); }

      .am-td {
        padding: 14px 16px;
        font-size: 13px;
        color: var(--am-text2);
        vertical-align: middle;
      }
      .am-td--dot   { padding: 14px 8px 14px 20px; width: 32px; }
      .am-td--name  { color: var(--am-text); font-weight: 500; white-space: nowrap; }
      .am-td--muted { color: var(--am-text2); }
      .am-td--subject { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .am-td--bold  { font-weight: 700 !important; color: var(--am-text) !important; }
      .am-td--nowrap { white-space: nowrap; }
      .am-td--actions { text-align: right; padding-right: 20px; }

      @media (max-width: 767px) { .am-td--hide-sm, .am-th--hide-sm { display: none; } }
      @media (max-width: 1023px) { .am-td--hide-md, .am-th--hide-md { display: none; } }

      /* Unread dot */
      .am-dot {
        display: inline-block;
        width: 8px; height: 8px; border-radius: 50%;
        background: transparent;
      }
      .am-dot--on { background: var(--am-accent); box-shadow: 0 0 0 3px var(--am-accentl); }

      /* Status badges */
      .am-status {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 9999px;
        font-size: 11px; font-weight: 700;
      }
      .am-status--read {
        background: var(--am-greenl); color: var(--am-green);
        border: 1px solid rgba(16,185,129,0.2);
      }
      .am-status--unread {
        background: var(--am-accentl); color: var(--am-accent);
        border: 1px solid var(--am-accentb);
      }

      /* Action buttons */
      .am-action-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 32px; height: 32px; border-radius: 9px;
        border: none; cursor: pointer;
        transition: background 0.15s, color 0.15s, transform 0.15s;
        background: transparent; color: var(--am-text3);
      }
      .am-action-btn:hover { transform: scale(1.1); }
      .am-action-btn--view:hover  { background: var(--am-indigol); color: var(--am-indigo); }
      .am-action-btn--delete:hover { background: var(--am-redl); color: var(--am-red); }

      /* ── Modal ── */
      .am-modal-body { display: flex; flex-direction: column; gap: 20px; }
      .am-modal-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      }
      @media (max-width: 480px) { .am-modal-grid { grid-template-columns: 1fr; } }
      .am-modal-field { display: flex; flex-direction: column; gap: 4px; }
      .am-modal-label {
        font-size: 10px; font-weight: 800; color: var(--am-text3);
        text-transform: uppercase; letter-spacing: 0.08em;
      }
      .am-modal-value { font-size: 14px; font-weight: 500; color: var(--am-text); }
      .am-modal-link {
        font-size: 14px; color: var(--am-indigo); text-decoration: none; font-weight: 500;
      }
      .am-modal-link:hover { text-decoration: underline; }
      .am-modal-message-wrap {
        display: flex; flex-direction: column; gap: 8px;
        padding-top: 16px;
        border-top: 1.5px solid var(--am-border);
      }
      .am-modal-message {
        background: var(--am-bg); border: 1.5px solid var(--am-border);
        border-radius: 14px; padding: 16px;
        font-size: 14px; color: var(--am-text2);
        line-height: 1.7; white-space: pre-wrap;
      }
      .am-modal-footer {
        display: flex; align-items: center; justify-content: flex-end; gap: 10px;
        padding-top: 16px; border-top: 1.5px solid var(--am-border);
      }
      .am-reply-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 18px; border-radius: 10px;
        background: var(--am-accent); color: #fff;
        font-family: var(--ff-body); font-size: 13px; font-weight: 700;
        border: none; cursor: pointer;
        transition: background 0.18s, transform 0.15s;
        box-shadow: 0 4px 14px var(--am-accentb);
      }
      .am-reply-btn:hover  { background: var(--am-accent2); transform: translateY(-1px); }
      .am-reply-btn:active { transform: scale(0.97); }

      .am-delete-text {
        font-size: 14px; color: var(--am-text2); line-height: 1.6; margin: 0;
      }
      .am-delete-text strong { color: var(--am-text); }

      /* ── Keyframes ── */
      @keyframes amPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
    `}</style>
  )
}