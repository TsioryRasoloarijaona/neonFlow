import { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useNoteStore } from '../../stores/noteStore'
import { toast } from '../ui/Toast'
import { Badge } from '../ui/Badge'
import { Search } from 'lucide-react'

interface NotesProps {
  selectedNoteId?: string | null
}

export default function Notes({ selectedNoteId }: NotesProps) {
  const { notes, currentNote, fetchNotes, createNote, updateNote, deleteNote, setCurrentNote } = useNoteStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    underline: false
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  // Handle selected note from search
  useEffect(() => {
    if (selectedNoteId && notes.length > 0) {
      const note = notes.find(n => n.id === selectedNoteId)
      if (note) {
        setCurrentNote(note)
        setSearchQuery(note.title)
      }
    }
  }, [selectedNoteId, notes, setCurrentNote])

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setContent(currentNote.content)
    }
  }, [currentNote])

  useEffect(() => {
    const editorDiv = textareaRef.current as any
    if (editorDiv && editorDiv.innerHTML !== content) {
      const selection = window.getSelection()
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
      const startOffset = range?.startOffset || 0
      
      editorDiv.innerHTML = content
      
      // Restore cursor position
      if (range && editorDiv.firstChild) {
        try {
          const newRange = document.createRange()
          newRange.setStart(editorDiv.firstChild, Math.min(startOffset, editorDiv.firstChild.textContent?.length || 0))
          newRange.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(newRange)
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [content])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      if (currentNote) {
        await updateNote(currentNote.id!, { title, content })
        toast.success('Note updated!')
      } else {
        await createNote({ title, content, tags: [] })
        toast.success('Note created!')
        setTitle('')
        setContent('')
      }
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleNew = () => {
    setCurrentNote(null)
    setTitle('')
    setContent('')
  }

  const handleDelete = async () => {
    if (!currentNote) return
    
    if (confirm('Delete this note?')) {
      await deleteNote(currentNote.id!)
      toast.success('Note deleted')
      handleNew()
    }
  }

  const applyFormat = (formatType: 'bold' | 'underline' | 'bulletList') => {
    if (formatType === 'bulletList') {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        toast.error('Please select text first')
        return
      }

      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      if (!selectedText) {
        toast.error('Please select text first')
        return
      }

      // Apply list formatting: add bullet to each line, preserving line breaks
      const lines = selectedText.split('\n')
      const formattedLines = lines.map(line => `• ${line}`)
      
      // Create a document fragment to preserve line breaks
      const fragment = document.createDocumentFragment()
      formattedLines.forEach((line, index) => {
        fragment.appendChild(document.createTextNode(line))
        if (index < formattedLines.length - 1) {
          fragment.appendChild(document.createElement('br'))
        }
      })
      
      range.deleteContents()
      range.insertNode(fragment)
      
      const editorDiv = textareaRef.current as any
      if (editorDiv) {
        setContent(editorDiv.innerHTML)
      }
      return
    }

    // Toggle format for bold, underline, color
    const isActive = activeFormats[formatType as keyof typeof activeFormats]
    
    if (isActive) {
      // Deactivate: remove format
      if (formatType === 'bold') {
        document.execCommand('bold', false)
      } else if (formatType === 'underline') {
        document.execCommand('underline', false)
      }
      setActiveFormats(prev => ({ ...prev, [formatType]: false }))
    } else {
      // Activate: apply format
      if (formatType === 'bold') {
        document.execCommand('bold', false)
      } else if (formatType === 'underline') {
        document.execCommand('underline', false)
      }
      setActiveFormats(prev => ({ ...prev, [formatType]: true }))
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Strip HTML tags for display in list
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Notes</h1>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <strong className="text-[#2563EB] dark:text-[#60A5FA]">Astuce:</strong> Utilisez [[Titre]] pour créer des liens entre notes
          </p>
        </div>
        <Button icon="+" onClick={handleNew}>
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="flex flex-col">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />}
            className="mb-4"
          />

          <div className="space-y-2 overflow-y-auto h-[calc(100vh-220px)]">{filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setCurrentNote(note)}
                className={`
                  w-full p-4 text-left rounded-md border transition-all duration-200
                  ${currentNote?.id === note.id 
                    ? 'border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)] shadow-sm' 
                    : 'border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                  }
                `}
              >
                <h3 className="font-medium text-[#1F2937] dark:text-[#E6EDF3] mb-1">{note.title}</h3>
                {note.createdAt && (
                  <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mb-1">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2">{stripHtml(note.content)}</p>
                {note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}

            {filteredNotes.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">No notes found</p>
              </Card>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 text-2xl font-bold"
            />

            {/* Formatting Toolbar */}
            <div className="flex gap-2 mb-3 pb-3 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => applyFormat('bold')}
                className={`px-3 h-8 flex items-center justify-center rounded-md border transition-all duration-200 text-[#1F2937] dark:text-[#E6EDF3] font-bold text-sm ${
                  activeFormats.bold
                    ? 'border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)]'
                    : 'border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[rgba(59,130,246,0.1)]'
                }`}
                title="Bold - Click to toggle"
              >
                B
              </button>
              <button
                onClick={() => applyFormat('underline')}
                className={`px-3 h-8 flex items-center justify-center rounded-md border transition-all duration-200 text-[#1F2937] dark:text-[#E6EDF3] underline text-sm ${
                  activeFormats.underline
                    ? 'border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.15)]'
                    : 'border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[rgba(59,130,246,0.1)]'
                }`}
                title="Underline - Click to toggle"
              >
                U
              </button>
              <div className="w-px bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.08)]"></div>
              <button
                onClick={() => applyFormat('bulletList')}
                className="px-3 h-8 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#161B22] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[rgba(59,130,246,0.1)] transition-all duration-200 text-[#1F2937] dark:text-[#E6EDF3] text-sm"
                title="Bullet List"
              >
                •
              </button>
            </div>

            <div
              ref={textareaRef as any}
              contentEditable
              dir="ltr"
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              suppressContentEditableWarning
              className="
                w-full h-[500px] p-4 
                bg-white dark:bg-[#161B22]
                border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
                rounded-md
                text-[#1F2937] dark:text-[#E6EDF3]
                resize-none 
                overflow-auto
                focus:outline-none 
                focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]
                focus:border-[#2563EB] dark:focus:border-[#3B82F6]
                transition-all duration-200
              "
              style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', direction: 'ltr', textAlign: 'left', unicodeBidi: 'bidi-override' }}
            />
            {content === '' && (
              <div className="absolute mt-[-496px] ml-4 text-[#9CA3AF] dark:text-[#6B7280] pointer-events-none">
                Start writing... Use [[Note Title]] to link to other notes
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  Save
                </Button>
                {currentNote && (
                  <Button variant="danger" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
              </div>

              <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] text-right">
                {currentNote?.createdAt && (
                  <p>
                    Créé: {new Date(currentNote.createdAt).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {currentNote?.updatedAt && (
                  <p>
                    Modifié: {new Date(currentNote.updatedAt).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                <p>{content.length} caractères</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
