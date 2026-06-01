import { useState, useEffect } from 'react'
import {
  Mail,
  MailOpen,
  Eye,
  Trash2,
  MessageSquare,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters.js'

const FILTER_TABS = ['All', 'Unread', 'Read']

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  // View modal
  const [viewingMessage, setViewingMessage] = useState(null)
  const [showView, setShowView] = useState(false)

  // Delete modal
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      console.error('Fetch messages error:', err)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const unreadCount = messages.filter((m) => !m.is_read).length

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'Unread') return !m.is_read
    if (activeFilter === 'Read') return m.is_read
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
    } catch (err) {
      console.error('Mark as read error:', err)
    }
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
      toast.success('Message deleted successfully')
      setShowDelete(false)
      setDeletingMessage(null)
    } catch (err) {
      console.error('Delete message error:', err)
      toast.error(err.message || 'Failed to delete message')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Contact Messages
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage messages from your customers
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 text-xs font-bold text-white bg-indigo-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-white/20">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-3 w-3 rounded-full" />
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <MessageSquare
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
              size={48}
            />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No messages found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {activeFilter !== 'All'
                ? `No ${activeFilter.toLowerCase()} messages.`
                : 'Messages from the contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="w-8 px-6 py-3" />
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    From
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredMessages.map((message, idx) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-gray-50/50 dark:bg-slate-800/50'
                    } ${!message.is_read ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {!message.is_read ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-transparent" />
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        !message.is_read
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {message.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {message.email}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm max-w-[200px] truncate ${
                        !message.is_read
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {message.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {message.is_read ? (
                        <Badge variant="default">
                          <MailOpen size={12} className="mr-1" />
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="info">
                          <Mail size={12} className="mr-1" />
                          Unread
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(message)}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                          title="View message"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingMessage(message)
                            setShowDelete(true)
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      <Modal
        isOpen={showView}
        onClose={() => setShowView(false)}
        title="Message Details"
        size="lg"
      >
        {viewingMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  From
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {viewingMessage.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <a
                    href={`mailto:${viewingMessage.email}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {viewingMessage.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(viewingMessage.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Subject
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {viewingMessage.subject}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Message
              </p>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {viewingMessage.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button variant="ghost" onClick={() => setShowView(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `mailto:${viewingMessage.email}?subject=Re: ${viewingMessage.subject}`
                }}
              >
                <Mail size={16} />
                Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Message"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the message from{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {deletingMessage?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
