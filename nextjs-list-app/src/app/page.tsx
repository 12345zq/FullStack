'use client';

import React, { useState, useEffect, useMemo } from 'react';

// 生成1000条模拟数据
const generateData = () => {
  const data = [];
  const categories = ['Technology', 'Health', 'Finance', 'Travel', 'Entertainment'];
  for (let i = 1; i <= 1000; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      description: `This is a detailed description for item number ${i} in the list. It provides more context about what this item represents.`,
      value: Math.floor(Math.random() * 1000),
      imageUrl: `https://picsum.photos/seed/${i}/200/150`,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    });
  }
  return data;
};

// 列表项组件
const ListItem = ({ item, isHovered }: { item: any, isHovered: boolean }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out my-[10px]">
      <div className={`p-4 transition-all duration-300 ${isHovered ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' : ''}`}>
        <div className="flex flex-row items-center">
          {/* 左侧：图片 */}
          <div className="flex-shrink-0 mr-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-4 h-4 object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
          
          {/* 右侧：文本 */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors truncate">
              {item.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 简单的虚拟滚动组件
const VirtualList = ({ items, itemHeight, height }: any) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const itemCount = items.length;
  const containerHeight = height;
  const totalHeight = itemHeight * itemCount;

  // 计算可见的项目范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight));

  // 计算偏移量
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg border border-gray-100"
      style={{ height: containerHeight, position: 'relative', overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* 滚动条样式 */}
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, width: '100%' }}>
          {items.slice(startIndex, endIndex + 1).map((item: any, index: number) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={item.id}
                style={{ height: itemHeight, width: '100%' }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <ListItem item={item} isHovered={hoveredItem === item.id} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 500);
  }, []);

  // 过滤数据
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  // 获取所有分类
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return ['all', ...uniqueCategories];
  }, [data]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Enhanced Item List
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Browse through our extensive collection of 1000 items with optimized performance
          </p>
          
          {/* 搜索和筛选功能 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredData.length}</span> items
          </p>
        </div>
        
        <VirtualList
          items={filteredData}
          itemHeight={150}
          height={700}
        />
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Optimized with virtual scrolling for smooth performance</p>
          <p className="mt-2">Hover over items for interactive effects</p>
        </div>
      </div>
    </div>
  );
}