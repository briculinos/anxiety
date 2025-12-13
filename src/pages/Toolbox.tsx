import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, Quote, Image, Music, X, Star, Trash2 } from 'lucide-react'
import { Button, Card, Chip } from '../components/common'
import { getToolboxItems, addToolboxItem, db } from '../db'
import type { ToolboxItem } from '../types'

type ItemType = 'mantra' | 'memory' | 'playlist' | 'technique'

const itemTypeConfig = {
  mantra: { icon: Quote, label: 'Mantra', color: 'bg-purple-500/20 text-purple-400' },
  memory: { icon: Image, label: 'Safe Memory', color: 'bg-blue-500/20 text-blue-400' },
  playlist: { icon: Music, label: 'Playlist', color: 'bg-green-500/20 text-green-400' },
  technique: { icon: Heart, label: 'Technique', color: 'bg-pink-500/20 text-pink-400' }
}

export function Toolbox() {
  const [items, setItems] = useState<ToolboxItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItemType, setNewItemType] = useState<ItemType>('mantra')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemContent, setNewItemContent] = useState('')
  const [newItemUrl, setNewItemUrl] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    const toolboxItems = await getToolboxItems()
    setItems(toolboxItems)
  }

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return

    await addToolboxItem({
      type: newItemType,
      title: newItemTitle,
      content: newItemContent,
      url: newItemUrl || undefined,
      isFavorite: false
    })

    setNewItemTitle('')
    setNewItemContent('')
    setNewItemUrl('')
    setShowAddModal(false)
    loadItems()
  }

  const handleToggleFavorite = async (item: ToolboxItem) => {
    await db.toolboxItems.update(item.id, { isFavorite: !item.isFavorite })
    loadItems()
  }

  const handleDeleteItem = async (id: string) => {
    await db.toolboxItems.delete(id)
    loadItems()
  }

  const favoriteItems = items.filter(i => i.isFavorite)
  const otherItems = items.filter(i => !i.isFavorite)

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900 mb-2">Your Toolbox</h1>
        <p className="text-warm-900/60 text-sm">
          Personal coping tools that work for you
        </p>
      </div>

      {/* Add button */}
      <Button
        variant="secondary"
        onClick={() => setShowAddModal(true)}
        className="w-full mb-6"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add to toolbox
      </Button>

      {/* Empty state */}
      {items.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center">
            <Heart className="w-8 h-8 text-warm-500" />
          </div>
          <h3 className="text-lg font-medium text-warm-900 mb-2">Your toolbox is empty</h3>
          <p className="text-warm-900/60 text-sm max-w-xs mx-auto">
            Add mantras, safe memories, playlists, or techniques that help you feel calm.
          </p>
        </Card>
      )}

      {/* Favorites */}
      {favoriteItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-warm-900/60 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Favorites
          </h2>
          <div className="space-y-3">
            {favoriteItems.map((item) => (
              <ToolboxItemCard
                key={item.id}
                item={item}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other items */}
      {otherItems.length > 0 && (
        <div>
          {favoriteItems.length > 0 && (
            <h2 className="text-sm font-medium text-warm-900/60 mb-3">All items</h2>
          )}
          <div className="space-y-3">
            {otherItems.map((item) => (
              <ToolboxItemCard
                key={item.id}
                item={item}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-warm-50 rounded-t-3xl p-6 safe-bottom"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-warm-900">Add to Toolbox</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full bg-warm-100 text-warm-900/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-warm-900 mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(itemTypeConfig) as ItemType[]).map((type) => (
                    <Chip
                      key={type}
                      selected={newItemType === type}
                      onClick={() => setNewItemType(type)}
                    >
                      {itemTypeConfig[type].label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="text-sm font-medium text-warm-900 mb-2 block">Title</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder={
                    newItemType === 'mantra' ? 'e.g., This will pass'
                    : newItemType === 'memory' ? 'e.g., Beach sunset'
                    : newItemType === 'playlist' ? 'e.g., Calm piano'
                    : 'e.g., Deep breathing'
                  }
                  className="w-full bg-warm-100 border border-warm-200 rounded-xl p-3 text-warm-900 placeholder-warm-900/40 focus:outline-none focus:ring-2 focus:ring-warm-500"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="text-sm font-medium text-warm-900 mb-2 block">
                  {newItemType === 'mantra' ? 'Your mantra'
                  : newItemType === 'memory' ? 'Describe the memory'
                  : newItemType === 'playlist' ? 'Description'
                  : 'How it helps'}
                </label>
                <textarea
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder={
                    newItemType === 'mantra' ? 'Write your calming phrase...'
                    : newItemType === 'memory' ? 'Describe what you see, hear, feel...'
                    : newItemType === 'playlist' ? 'What kind of music is it?'
                    : 'Describe the technique...'
                  }
                  className="w-full h-24 bg-warm-100 border border-warm-200 rounded-xl p-3 text-warm-900 placeholder-warm-900/40 focus:outline-none focus:ring-2 focus:ring-warm-500 resize-none"
                />
              </div>

              {/* URL (optional) */}
              {newItemType === 'playlist' && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-warm-900 mb-2 block">
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-warm-100 border border-warm-200 rounded-xl p-3 text-warm-900 placeholder-warm-900/40 focus:outline-none focus:ring-2 focus:ring-warm-500"
                  />
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleAddItem}
                disabled={!newItemTitle.trim() || !newItemContent.trim()}
                className="w-full"
              >
                Add to Toolbox
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ToolboxItemCardProps {
  item: ToolboxItem
  onToggleFavorite: (item: ToolboxItem) => void
  onDelete: (id: string) => void
}

function ToolboxItemCard({ item, onToggleFavorite, onDelete }: ToolboxItemCardProps) {
  const [showActions, setShowActions] = useState(false)
  const config = itemTypeConfig[item.type as ItemType] || itemTypeConfig.technique
  const Icon = config.icon

  return (
    <Card
      className="relative"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color.split(' ')[0]}`}>
          <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-warm-900 truncate">{item.title}</h3>
            {item.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          </div>
          <p className="text-sm text-warm-900/60 line-clamp-2">{item.content}</p>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-warm-500 hover:underline mt-1 inline-block"
            >
              Open link
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-warm-200 flex gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(item)
              }}
              className="flex-1"
            >
              <Star className={`w-4 h-4 mr-1 ${item.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {item.isFavorite ? 'Unfavorite' : 'Favorite'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
