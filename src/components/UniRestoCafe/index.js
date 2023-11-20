import {useEffect, useState} from 'react'
import CategoryMenu from '../CategoryMenu'
import Dish from '../Dish'

const UniRestoCafe = () => {
  const [restaurantInfo, setRestaurantInfo] = useState({})
  const [menuData, setMenuData] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [cart, setCart] = useState({})
  const [totalDishQuantity, setTotalDishQuantity] = useState(0)
  const [categoryQuantity, setCategoryQuantity] = useState({})

  useEffect(() => {
    const dishesApiUrl =
      'https://run.mocky.io/v3/77a7e71b-804a-4fbd-822c-3e365d3482cc'

    const fetchData = async () => {
      try {
        const response = await fetch(dishesApiUrl)
        const data = await response.json()

        setRestaurantInfo({
          restaurantId: data.restaurant_id,
          restaurantName: data[0].restaurant_name,
          restaurantImage: data.restaurant_image,
          tableId: data.table_id,
          tableName: data.table_name,
          branchName: data.branch_name,
        })

        setMenuData(data[0].table_menu_list || [])

        setActiveCategory(
          data[0].table_menu_list && data[0].table_menu_list.length > 0
            ? data[0].table_menu_list[0].menu_category
            : '',
        )

        const categoryQuantities = data[0].table_menu_list.reduce(
          (quantities, category) => ({
            ...quantities,
            [category.menu_category]: 0,
          }),
          {},
        )
        setCategoryQuantity(categoryQuantities)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleCategoryChange = category => {
    setActiveCategory(category)
  }

  const getTotalQuantityForCategory = category => {
    if (
      activeCategory === 'From the Barnyard' ||
      category === 'From the Barnyard'
    ) {
      // Calculate total dish quantity specifically for 'From the Barnyard'
      let totalFromBarnyard = 0
      const barnyardCategory = menuData.find(
        cat => cat.menu_category === 'From the Barnyard',
      )

      if (barnyardCategory) {
        barnyardCategory.category_dishes.forEach(dish => {
          totalFromBarnyard += cart[dish.dish_id] || 0
        })
      }
      return totalFromBarnyard
    }

    let total = 0
    menuData.forEach(cat => {
      if (cat.menu_category === category) {
        cat.category_dishes.forEach(dish => {
          total += cart[dish.dish_id] || 0
        })
      }
    })
    return total
  }

  const handleIncrement = (dishId, category) => {
    if (activeCategory === 'Salads and Soup') {
      // Increment the cart count and dish quantity specifically for 'Salads and Soup'
      setCart(prevCart => ({
        ...prevCart,
        [dishId]: (prevCart[dishId] || 0) + 1,
      }))
      setTotalDishQuantity(prevTotal => prevTotal + 1)
      setCategoryQuantity(prevQty => ({
        ...prevQty,
        [category]: (prevQty[category] || 0) + 1,
      }))
    } else {
      // For other categories, perform the default increment logic
      setCart(prevCart => ({
        ...prevCart,
        [dishId]: (prevCart[dishId] || 0) + 1,
      }))
      setTotalDishQuantity(prevTotal => prevTotal + 1)
      setCategoryQuantity(prevQty => ({
        ...prevQty,
        [category]: (prevQty[category] || 0) + 1,
      }))
    }
  }

  const handleDecrement = (dishId, category) => {
    if (activeCategory === 'Salads and Soup' && cart[dishId] > 0) {
      // Decrement the cart count and dish quantity specifically for 'Salads and Soup'
      setCart(prevCart => ({
        ...prevCart,
        [dishId]: prevCart[dishId] - 1,
      }))
      setTotalDishQuantity(prevTotal => prevTotal - 1)
      setCategoryQuantity(prevQty => ({
        ...prevQty,
        [category]: prevQty[category] - 1,
      }))
    } else if (cart[dishId] > 0) {
      // For other categories or if the dish quantity is greater than zero, perform the default decrement logic
      setCart(prevCart => ({
        ...prevCart,
        [dishId]: prevCart[dishId] - 1,
      }))
      setTotalDishQuantity(prevTotal => prevTotal - 1)
      setCategoryQuantity(prevQty => ({
        ...prevQty,
        [category]: prevQty[category] - 1,
      }))
    }
  }

  const displaySaladsAndSoupDetails = () => {
    if (activeCategory === 'Salads and Soup') {
      const currentCategory = menuData.find(
        cat => cat.menu_category === activeCategory,
      )

      if (currentCategory && currentCategory.category_dishes.length > 0) {
        const saladAndSoupDish = currentCategory.category_dishes[0]

        return (
          <div>
            <h4>{saladAndSoupDish.dish_name}</h4>
            <p>
              {saladAndSoupDish.dish_currency} {saladAndSoupDish.dish_price}
            </p>
            <p>{saladAndSoupDish.dish_description}</p>
            <p>{saladAndSoupDish.dish_calories} calories</p>
          </div>
        )
      }
    }
    return null
  }

  const displayFromTheBarnyardDetails = () => {
    if (activeCategory === 'From the Barnyard') {
      const currentCategory = menuData.find(
        cat => cat.menu_category === activeCategory,
      )

      if (currentCategory && currentCategory.category_dishes.length > 0) {
        const barnyardDish = currentCategory.category_dishes[0]

        return (
          <div>
            {/* Display the image for the dish */}
            <img src={barnyardDish.dish_image} alt="Dish" />
          </div>
        )
      }
    }
    return null
  }

  const displayDetailsBasedOnCategory = () => {
    const currentCategory = menuData.find(
      cat => cat.menu_category === activeCategory,
    )

    if (currentCategory) {
      if (activeCategory === 'Fast Food') {
        return (
          <div>
            {currentCategory.addonCat && (
              <p>Customizations available: {currentCategory.addonCat}</p>
            )}
            {currentCategory.category_dishes.map(dish => (
              <Dish
                key={dish.dish_id}
                dish={dish}
                quantity={cart[dish.dish_id] || 0}
                cart={cart}
                activeCategory={activeCategory}
                onIncrement={() =>
                  handleIncrement(dish.dish_id, activeCategory)
                }
                onDecrement={() =>
                  handleDecrement(dish.dish_id, activeCategory)
                }
              />
            ))}
          </div>
        )
      }

      return currentCategory.category_dishes.map(dish => (
        <Dish
          key={dish.dish_id}
          dish={dish}
          quantity={cart[dish.dish_id] || 0}
          cart={cart}
          activeCategory={activeCategory}
          onIncrement={() => handleIncrement(dish.dish_id, activeCategory)}
          onDecrement={() => handleDecrement(dish.dish_id, activeCategory)}
        />
      ))
    }

    return null
  }

  return (
    <div>
      <h1> {restaurantInfo.restaurantName || 'UNI Resto Cafe'} </h1>{' '}
      <header>
        <h2> My Orders </h2> <p> Total Dish Quantity: {totalDishQuantity} </p>{' '}
      </header>{' '}
      <CategoryMenu
        menuData={menuData}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <div>
        {' '}
        {activeCategory && (
          <div>
            <h3>
              {' '}
              {activeCategory}
              {displayFromTheBarnyardDetails()}{' '}
            </h3>{' '}
            {displaySaladsAndSoupDetails()} {displayDetailsBasedOnCategory()}{' '}
            <footer>
              <p> Cart Count: {getTotalQuantityForCategory(activeCategory)} </p>{' '}
            </footer>{' '}
          </div>
        )}{' '}
      </div>{' '}
      <div>
        <h3> Cart Total </h3>{' '}
        {Object.entries(categoryQuantity).map(([category, quantity]) => (
          <p key={category}>
            {' '}
            {category}: {quantity}{' '}
          </p>
        ))}{' '}
      </div>{' '}
    </div>
  )
}

export default UniRestoCafe
