import { useState } from "react";

const categories = [
    { id: 1,  icon: "🏠", label: "Apartments"  },
    { id: 2,  icon: "🏡", label: "Houses"      },
    { id: 3,  icon: "👤", label: "People"      },
    { id: 4,  icon: "👥", label: "Accounts"    },
    { id: 5,  icon: "📍", label: "Address"     },
    { id: 6,  icon: "💳", label: "Billing"     },
    { id: 7,  icon: "🧾", label: "Receipts"    },
    { id: 8,  icon: "🔑", label: "Renting"     },
    { id: 9,  icon: "🛡️", label: "Users"       },
    
];

function Category() {
    const [active, setActive] = useState(null);

    return (
        <div className="category-grid">
            {categories.map((cat) => (
                <div
                    key={cat.id}
                    className={`cat${active === cat.id ? " active-cat" : ""}`}
                    onClick={() => {
                        setActive(cat.id === active ? null : cat.id)
                       
                    }}
                >
                    <span className="cat-icon">{cat.icon}</span>
                    <p>{cat.label}</p>
                </div>
            ))}
        </div>
    );
}


export default Category;
